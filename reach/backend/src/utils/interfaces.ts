import { PhoneNumberRecord } from './phoneNumberTypes';

export interface CallLog {
    fromNumber: string;
    toNumber: string;
    status?: string;
    statusReason: string;
    callId: string;
    startTime: Date;
    endTime: Date;
}

export interface TelnyxClientConfig {
    workspaceId: number;
    apiKey: string;
    connectionId: string;
    username: string;
    password: string;
    publicKey: string;
    smsNumbers: PhoneNumberRecord[];
    callerIds?: PhoneNumberRecord[];
}