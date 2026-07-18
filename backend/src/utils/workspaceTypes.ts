export interface CreateWorkspacePayload {
    name: string;
}

export interface WorkspaceMemberView {
    id: number;
    name: string;
    role: string;
    isDefault: boolean | null;
    inviteAccepted: boolean | null;
    plan: string | null;
}

export interface WorkspaceView {
    id: number;
    name: string;
    slug: string | null;
    plan: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}
