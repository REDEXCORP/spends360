import { eq } from 'drizzle-orm';
import { db } from '../db';
import { telnyxConfigs } from '../db/schema/telnyxConfigs';
import { PhoneNumberRecord } from '../utils/phoneNumberTypes';

export type TelnyxConfigUpsert = {
    workspaceId: number;
    apiKeyEncrypted: string;
    connectionId: string;
    username: string;
    passwordEncrypted: string;
    publicKeyEncrypted: string;
    smsNumbers: PhoneNumberRecord[];
    callerIds: PhoneNumberRecord[];
    updatedBy: number;
};

export const getByWorkspaceId = async (workspaceId: number) => {
    const result = await db
        .select()
        .from(telnyxConfigs)
        .where(eq(telnyxConfigs.workspaceId, workspaceId))
        .limit(1);

    return result[0];
};

export const listAll = async () => {
    return await db.select().from(telnyxConfigs);
};

export const upsert = async (data: TelnyxConfigUpsert) => {
    const existing = await getByWorkspaceId(data.workspaceId);

    if (existing) {
        const result = await db
            .update(telnyxConfigs)
            .set({
                apiKeyEncrypted: data.apiKeyEncrypted,
                connectionId: data.connectionId,
                username: data.username,
                passwordEncrypted: data.passwordEncrypted,
                publicKeyEncrypted: data.publicKeyEncrypted,
                smsNumbers: data.smsNumbers,
                callerIds: data.callerIds,
                updatedAt: new Date(),
                updatedBy: data.updatedBy,
            })
            .where(eq(telnyxConfigs.workspaceId, data.workspaceId))
            .returning();

        return result[0];
    }

    const result = await db
        .insert(telnyxConfigs)
        .values({
            workspaceId: data.workspaceId,
            apiKeyEncrypted: data.apiKeyEncrypted,
            connectionId: data.connectionId,
            username: data.username,
            passwordEncrypted: data.passwordEncrypted,
            publicKeyEncrypted: data.publicKeyEncrypted,
            smsNumbers: data.smsNumbers,
            callerIds: data.callerIds,
            updatedBy: data.updatedBy,
        })
        .returning();

    return result[0];
};
