export interface CreateProductPayload {
    name: string;
    description?: string;
}

export interface ProductView {
    id: number;
    workspaceId: number;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}
