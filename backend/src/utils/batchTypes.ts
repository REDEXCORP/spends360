export interface CreateBatchPayload {
    name: string;
    description?: string;
    tags?: string[];
}

export interface BatchView {
    id: number;
    workspaceId: number;
    name: string;
    description: string | null;
    tags: string[];
    createdAt: Date | null;
    updatedAt: Date | null;
}
