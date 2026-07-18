export function withWorkspaceAudit<T extends Record<string, unknown>>(
    data: T,
    workspaceId: number,
    userId: number
) {
    return {
        ...data,
        workspaceId,
        createdBy: userId,
        updatedBy: userId,
    };
}
