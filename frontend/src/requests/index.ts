import { apiRequestV1 } from './services';
import type {
    Batch,
    CreateBatchBody,
    CreateLeadBody,
    CreatePilotBody,
    CreateProductBody,
    InviteDetails,
    Lead,
    Pilot,
    Product,
    TelnyxConfigForm,
    TelnyxConfigPublicView,
} from './types';

export type {
    Batch,
    CreateBatchBody,
    CreateLeadBody,
    CreatePilotBody,
    CreateProductBody,
    InviteDetails,
    Lead,
    PhoneNumberRecord,
    Pilot,
    Product,
    TelnyxConfigForm,
    TelnyxConfigPublicView,
    WorkspaceSummary,
} from './types';

export const auth = {
    login: (body: unknown) => apiRequestV1.post('/auth/login', body),
    register: (body: { email: string; password: string }) => apiRequestV1.post('/auth/register', body),
    verifyRegister: (body: { email: string; otp: string }) =>
        apiRequestV1.post('/auth/verify-register', body),
    verifyOtp: (body: { email: string; otp: string; password: string }) => apiRequestV1.post('/auth/verify-otp', body),
    forgotPassword: (body: { email: string }) => apiRequestV1.post('/auth/forgot-password', body),
    resetPassword: (body: { email: string; otp: string; password: string }) => apiRequestV1.post('/auth/reset-password', body),
    logout: () => apiRequestV1.post('/auth/logout', {}),
};

export const user = {
    profile: () => apiRequestV1.get('/user/profile'),
    list: () => apiRequestV1.get('/user') as Promise<any[]>,
    create: (body: { email: string; role: 'ADMIN' | 'USER' }) => apiRequestV1.post('/user', body),
    remove: (userId: number) => apiRequestV1.del(`/user/members/${userId}`),
    deleteWorkspace: (workspaceId: number) => apiRequestV1.del(`/user/workspace/${workspaceId}`),
    getInviteDetails: (token: string) => apiRequestV1.get(`/user/invite?token=${encodeURIComponent(token)}`) as Promise<InviteDetails>,
    acceptInvite: (token: string) => apiRequestV1.post('/user/invite/accept', { token }),
    createWorkspace: (body: { name: string }) => apiRequestV1.post('/user/workspace', body),
    switchWorkspace: (workspaceId: number) => apiRequestV1.put(`/user/workspace/${workspaceId}`, {}),
    activateSubscription: (body: {
        billing: 'monthly' | 'yearly';
        users: number;
        paddleSubscriptionId?: string;
    }) => apiRequestV1.post('/user/subscription/activate', body),
};

export const calls = {
    list: () => apiRequestV1.get('/calls') as Promise<any[]>,
};

export const settings = {
    getTelnyxConfig: () => apiRequestV1.get('/settings/telnyx') as Promise<TelnyxConfigPublicView>,
    saveTelnyxConfig: (body: TelnyxConfigForm) =>
        apiRequestV1.put('/settings/telnyx', body) as Promise<TelnyxConfigPublicView>,
};

export const products = {
    list: () => apiRequestV1.get('/products') as Promise<Product[]>,
    create: (body: CreateProductBody) => apiRequestV1.post('/products', body) as Promise<Product>,
};

export const pilots = {
    list: () => apiRequestV1.get('/pilots') as Promise<Pilot[]>,
    create: (body: CreatePilotBody) => apiRequestV1.post('/pilots', body) as Promise<Pilot>,
};

export const batches = {
    list: () => apiRequestV1.get('/batches') as Promise<Batch[]>,
    create: (body: CreateBatchBody) => apiRequestV1.post('/batches', body) as Promise<Batch>,
};

export const leads = {
    list: () => apiRequestV1.get('/leads') as Promise<Lead[]>,
    create: (body: CreateLeadBody) => apiRequestV1.post('/leads', body) as Promise<Lead>,
};
