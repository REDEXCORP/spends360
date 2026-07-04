export interface CreateLeadPayload {
    name: string;
    phone: string;
    email?: string;
    source?: string;
    about?: string;
}

export interface LeadView {
    id: number;
    workspaceId: number;
    name: string;
    phone: string;
    email: string | null;
    source: string | null;
    about: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}
