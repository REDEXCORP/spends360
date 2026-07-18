import { eq, and, asc } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema/users';
import { workspaceMembers } from '../db/schema/workspaceMembers';

export type WorkspaceMemberInsert = typeof workspaceMembers.$inferInsert;

export const create = async (data: WorkspaceMemberInsert) => {
    const result = await db.insert(workspaceMembers).values(data).returning();
    return result[0];
};

export const getUserDefaultWorkspace = async (userId: number) => {
    const result = await db
        .select({ membership: workspaceMembers })
        .from(users)
        .innerJoin(
            workspaceMembers,
            and(
                eq(workspaceMembers.userId, users.id),
                eq(workspaceMembers.workspaceId, users.defaultWorkspaceId),
                eq(workspaceMembers.inviteAccepted, true)
            )
        )
        .where(eq(users.id, userId))
        .limit(1);
    return result[0]?.membership;
};

export const getUserFirstAcceptedWorkspace = async (userId: number) => {
    const result = await db
        .select()
        .from(workspaceMembers)
        .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.inviteAccepted, true)))
        .orderBy(asc(workspaceMembers.createdAt))
        .limit(1);
    return result[0];
};

export const getPendingInvitesByUserId = async (userId: number) => {
    return db
        .select()
        .from(workspaceMembers)
        .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.inviteAccepted, false)));
};

export const getWorkspaceMember = async (userId: number, workspaceId: number) => {
    const result = await db
        .select()
        .from(workspaceMembers)
        .where(
            and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId))
        )
        .limit(1);
    return result[0];
};

export const update = async (id: number, data: Partial<WorkspaceMemberInsert>) => {
    const result = await db
        .update(workspaceMembers)
        .set(data)
        .where(eq(workspaceMembers.id, id))
        .returning();
    return result[0];
};

export const setDefaultWorkspace = async (userId: number, workspaceId: number) => {
    await db
        .update(users)
        .set({ defaultWorkspaceId: workspaceId, updatedAt: new Date() })
        .where(eq(users.id, userId));
    return getWorkspaceMember(userId, workspaceId);
};

export const remove = async (userId: number, workspaceId: number) => {
    const result = await db
        .delete(workspaceMembers)
        .where(
            and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId))
        )
        .returning();
    return result[0];
};

export const countAdminsInWorkspace = async (workspaceId: number) => {
    const result = await db
        .select()
        .from(workspaceMembers)
        .where(
            and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, 'ADMIN'))
        );
    return result.length;
};

export const listUserIdsByWorkspaceId = async (workspaceId: number) => {
    const result = await db
        .select({ userId: workspaceMembers.userId })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, workspaceId));
    return result.map(row => row.userId);
};

export const ensureDefaultWorkspace = async (userId: number) => {
    const currentDefault = await getUserDefaultWorkspace(userId);
    if (currentDefault) return currentDefault;

    const firstAccepted = await getUserFirstAcceptedWorkspace(userId);
    if (!firstAccepted) {
        await db
            .update(users)
            .set({ defaultWorkspaceId: null, updatedAt: new Date() })
            .where(eq(users.id, userId));
        return null;
    }

    await setDefaultWorkspace(userId, firstAccepted.workspaceId);
    return firstAccepted;
};
