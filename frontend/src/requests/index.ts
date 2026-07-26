import { apiRequestV1 } from './services';
import type {
    ApprovalQueueItem,
    Batch,
    CreateBatchBody,
    CreateLeadBody,
    CreatePilotBody,
    CreateProductBody,
    CreateRequestBody,
    InviteDetails,
    Lead,
    Pilot,
    Product,
    SpendRequest,
} from './types';

export type {
    ApprovalQueueItem,
    Batch,
    CreateBatchBody,
    CreateLeadBody,
    CreatePilotBody,
    CreateProductBody,
    CreateRequestBody,
    InviteDetails,
    Lead,
    Pilot,
    Product,
    RequestApprover,
    RequestComment,
    RequestPriority,
    RequestStatus,
    SpendRequest,
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
};

export const billing = {
    get: () => apiRequestV1.get('/billing') as Promise<BillingSummary>,
    updateSeats: (users: number) =>
        apiRequestV1.patch('/billing/seats', { users }) as Promise<{ userCount: number }>,
    portal: () => apiRequestV1.post('/billing/portal', {}) as Promise<{ url: string }>,
};

export type BillingInvoice = {
    id: string;
    invoiceNumber: string | null;
    status: string;
    billedAt: string | null;
    currencyCode: string;
    total: string | null;
    invoicePdfUrl: string | null;
};

export type BillingSummary = {
    subscriptionStatus: string;
    subscriptionInterval: 'month' | 'year';
    userCount: number;
    includedUsers: number;
    minUsers: number;
    maxUsers: number;
    memberCount: number;
    nextBilledAt: string | null;
    paddleSubscriptionId: string | null;
    managementUrls: {
        updatePaymentMethod: string | null;
        cancel: string | null;
    };
    portalUrl: string | null;
    paddleError: string | null;
    invoices: BillingInvoice[];
};

export const spendRequests = {
    listMine: () => apiRequestV1.get('/requests/mine') as Promise<SpendRequest[]>,
    listMyTasks: () => apiRequestV1.get('/requests/assigned/mine') as Promise<SpendRequest[]>,
    listMyApprovals: () =>
        apiRequestV1.get('/requests/approvals/mine') as Promise<ApprovalQueueItem[]>,
    get: (requestId: number) =>
        apiRequestV1.get(`/requests/${requestId}`) as Promise<SpendRequest>,
    create: (body: CreateRequestBody) =>
        apiRequestV1.post('/requests', body) as Promise<SpendRequest>,
    cancel: (requestId: number) =>
        apiRequestV1.patch(`/requests/${requestId}/cancel`, {}) as Promise<SpendRequest>,
    addComment: ({ requestId, body }: { requestId: number; body: string }) =>
        apiRequestV1.post(`/requests/${requestId}/comments`, { body }) as Promise<SpendRequest>,
    decideApproval: ({
        approvalId,
        action,
        comment,
    }: {
        approvalId: number;
        action: 'APPROVED' | 'REJECTED';
        comment?: string;
    }) => apiRequestV1.patch(`/requests/approvals/${approvalId}`, { action, comment }),
};

export const calls = {
    list: () => apiRequestV1.get('/calls') as Promise<any[]>,
};

export const settings = {
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
