import { decrypt, encrypt } from '../infrastructure/encryption';
import * as telnyxConfigRepository from '../repositories/telnyxConfigRepository';
import { AppError } from '../utils/AppError';
import { TelnyxClientConfig } from '../utils/interfaces';
import { TelnyxConfigPayload, TelnyxConfigPublicView } from '../utils/telnyxConfigTypes';
import { clearTelnyxConfigCache } from '../config/telnyx';
import { telnyxConfigs } from '../db/schema/telnyxConfigs';
import { asPhoneRecords, hasPhoneRecords, PhoneNumberRecord } from '../utils/phoneNumberTypes';

type TelnyxConfigRow = typeof telnyxConfigs.$inferSelect;

function resolveCallerIds(
    callerIds: PhoneNumberRecord[],
    smsNumbers: PhoneNumberRecord[]
): PhoneNumberRecord[] {
    if (hasPhoneRecords(callerIds)) return callerIds;

    const primarySms = smsNumbers.find((record) => record.number?.trim());
    return primarySms ? [primarySms] : [];
}

function rowToPayload(row: TelnyxConfigRow): TelnyxConfigPayload {
    const smsNumbers = asPhoneRecords(row.smsNumbers);

    return {
        apiKey: decrypt(row.apiKeyEncrypted),
        connectionId: row.connectionId,
        username: row.username,
        password: decrypt(row.passwordEncrypted),
        publicKey: decrypt(row.publicKeyEncrypted),
        smsNumbers,
        callerIds: resolveCallerIds(asPhoneRecords(row.callerIds), smsNumbers),
    };
}

function toClientConfig(workspaceId: number, payload: TelnyxConfigPayload): TelnyxClientConfig {
    return {
        workspaceId,
        apiKey: payload.apiKey,
        connectionId: payload.connectionId,
        username: payload.username,
        password: payload.password,
        publicKey: payload.publicKey,
        smsNumbers: payload.smsNumbers,
        callerIds: payload.callerIds,
    };
}

export const getConfigByWorkspace = async (workspaceId: number): Promise<TelnyxClientConfig | undefined> => {
    const row = await telnyxConfigRepository.getByWorkspaceId(workspaceId);
    if (!row) return undefined;

    return toClientConfig(workspaceId, rowToPayload(row));
};

export const getAllConfigs = async (): Promise<TelnyxClientConfig[]> => {
    const rows = await telnyxConfigRepository.listAll();
    return rows.map((row) => toClientConfig(row.workspaceId, rowToPayload(row)));
};

export const getPublicView = async (workspaceId: number): Promise<TelnyxConfigPublicView> => {
    const row = await telnyxConfigRepository.getByWorkspaceId(workspaceId);
    if (!row) {
        return {
            configured: false,
            hasApiKey: false,
            hasPassword: false,
            hasPublicKey: false,
        };
    }

    const smsNumbers = asPhoneRecords(row.smsNumbers);

    return {
        configured: true,
        connectionId: row.connectionId,
        username: row.username,
        smsNumbers,
        callerIds: resolveCallerIds(asPhoneRecords(row.callerIds), smsNumbers),
        hasApiKey: Boolean(row.apiKeyEncrypted),
        hasPassword: Boolean(row.passwordEncrypted),
        hasPublicKey: Boolean(row.publicKeyEncrypted),
    };
};

const isPlaceholderSecret = (value?: string) =>
    !value?.trim() || value.trim() === 'unchanged';

export const saveConfig = async (
    workspaceId: number,
    payload: TelnyxConfigPayload,
    updatedBy: number
) => {
    if (!payload.connectionId?.trim()) throw new AppError('Connection ID is required', 400);
    if (!payload.username?.trim()) throw new AppError('Username is required', 400);
    if (!hasPhoneRecords(payload.smsNumbers)) throw new AppError('At least one SMS number is required', 400);

    const existing = await telnyxConfigRepository.getByWorkspaceId(workspaceId);
    const existingPayload = existing ? rowToPayload(existing) : null;

    const apiKey = isPlaceholderSecret(payload.apiKey)
        ? existingPayload?.apiKey
        : payload.apiKey.trim();
    const password = isPlaceholderSecret(payload.password)
        ? existingPayload?.password
        : payload.password.trim();
    const publicKey = isPlaceholderSecret(payload.publicKey)
        ? existingPayload?.publicKey
        : payload.publicKey.trim();

    if (!apiKey) throw new AppError('API key is required', 400);
    if (!password) throw new AppError('Password is required', 400);
    if (!publicKey) throw new AppError('Public key is required', 400);

    const smsNumbers = payload.smsNumbers.filter((record) => record.number?.trim());
    const callerIds = hasPhoneRecords(payload.callerIds)
        ? payload.callerIds!.filter((record) => record.number?.trim())
        : resolveCallerIds([], smsNumbers);

    await telnyxConfigRepository.upsert({
        workspaceId,
        apiKeyEncrypted: encrypt(apiKey),
        connectionId: payload.connectionId.trim(),
        username: payload.username.trim(),
        passwordEncrypted: encrypt(password),
        publicKeyEncrypted: encrypt(publicKey),
        smsNumbers,
        callerIds,
        updatedBy,
    });
    clearTelnyxConfigCache();

    return getPublicView(workspaceId);
};

