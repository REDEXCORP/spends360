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
