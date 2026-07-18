export interface CreatePilotPayload {
    name: string;
    email?: string;
    description?: string;
}

export interface PilotView {
    id: number;
    workspaceId: number;
    name: string;
    email: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}
