export interface ErrorObject {
    message?: string;
    statusCode?: number;
    details?: any;
}

export type RegistrationTokenPayload = {
    email: string;
};

export type InviteTokenPayload = {
    email: string;
    workspaceId: number;
    role: 'ADMIN' | 'USER';
};