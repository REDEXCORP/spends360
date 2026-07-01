import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { workspaceMembers } from '../db/schema/workspcaeMembers';

export const createWorkspaceMembers = async (userWorkspace: typeof workspaceMembers.$inferInsert) => {
    const result = await db.insert(workspaceMembers).values(userWorkspace).returning();
    return result[0];
};

export const getUserDefaultWorkspace = async (userId: number) => {
    const result = await db
        .select()
        .from(workspaceMembers)
        .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.isDefault, true)))
        .limit(1);
    return result[0];
};

export const getUserWorkspaces = async (userId: number) => {
    return await db.select().from(workspaceMembers).where(eq(workspaceMembers.userId, userId));
};

export const getWorkspaceMember = async (userId: number, workspaceId: number) => {
    const membership = await db
        .select()
        .from(workspaceMembers)
        .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)));
    return membership[0];
};

export const setDefaultWorkspace = async (userId: number, workspaceId: number) => {
    const result2 = await db
        .update(workspaceMembers)
        .set({ isDefault: true })
        .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)))
        .returning();
    return result2[0];
};
