import type { InviteDetails } from '@/helpers/invite';

export type { InviteDetails };

export interface WorkspaceSummary {
    id: number;
    name: string;
    role: string;
    isDefault: boolean | null;
    inviteAccepted: boolean | null;
    subscriptionStatus?: 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due' | 'paused';
    subscriptionInterval?: 'month' | 'year';
    userCount?: number;
}

export type RequestStatus =
    | 'PENDING'
    | 'IN_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'COMPLETED';

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface RequestApprover {
    id: number;
    requestId: number;
    approverId: number;
    position: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    comment?: string | null;
    actedAt: string | null;
    email: string;
}

export interface RequestComment {
    id: number;
    requestId: number;
    authorId: number;
    body: string;
    createdAt: string | null;
    authorEmail: string;
}

export interface SpendRequest {
    id: number;
    workspaceId: number;
    requesterId: number;
    type: string | null;
    title: string;
    description: string | null;
    justification: string | null;
    amount: string | null;
    currency: string;
    department: string | null;
    project: string | null;
    costCenter: string | null;
    vendor: string | null;
    category: string | null;
    priority: RequestPriority;
    status: RequestStatus;
    dueDate: string | null;
    assigneeId: number | null;
    assigneeEmail?: string | null;
    requesterEmail?: string | null;
    approvers?: RequestApprover[];
    comments?: RequestComment[];
    approvalId?: number | null;
    myApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    myApprovalPosition?: number | null;
    tags: string[];
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ApprovalQueueItem extends SpendRequest {
    approvalId: number | null;
    myApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    myApprovalPosition: number | null;
    currentApproverId: number | null;
    currentApproverEmail: string | null;
    requesterEmail: string;
}

export interface CreateRequestBody {
    type?: string;
    title: string;
    description?: string;
    justification?: string;
    amount?: number;
    currency?: string;
    department?: string;
    project?: string;
    costCenter?: string;
    vendor?: string;
    category?: string;
    priority?: RequestPriority;
    dueDate?: string;
    tags?: string[];
    approverIds: number[];
    assigneeId?: number;
}

export interface Product {
    id: number;
    workspaceId: number;
    name: string;
    description: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface CreateProductBody {
    name: string;
    description?: string;
}

export interface Pilot {
    id: number;
    workspaceId: number;
    name: string;
    email: string | null;
    description: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface CreatePilotBody {
    name: string;
    email?: string;
    description?: string;
}

export interface Batch {
    id: number;
    workspaceId: number;
    name: string;
    description: string | null;
    tags: string[];
    createdAt: string | null;
    updatedAt: string | null;
}

export interface CreateBatchBody {
    name: string;
    description?: string;
    tags?: string[];
}

export interface Lead {
    id: number;
    workspaceId: number;
    name: string;
    phone: string;
    email: string | null;
    source: string | null;
    about: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface CreateLeadBody {
    name: string;
    phone: string;
    email?: string;
    source?: string;
    about?: string;
}
