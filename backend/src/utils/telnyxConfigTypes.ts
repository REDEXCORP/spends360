import { PhoneNumberRecord } from './phoneNumberTypes';

export interface TelnyxConfigPayload {
    apiKey: string;
    connectionId: string;
    username: string;
    password: string;
    publicKey: string;
    smsNumbers: PhoneNumberRecord[];
    callerIds?: PhoneNumberRecord[];
}

export interface TelnyxConfigPublicView {
    configured: boolean;
    connectionId?: string;
    username?: string;
    smsNumbers?: PhoneNumberRecord[];
    callerIds?: PhoneNumberRecord[];
    hasApiKey: boolean;
    hasPassword: boolean;
    hasPublicKey: boolean;
}
