import { eq } from 'drizzle-orm';
import { db } from '../db';
import { workspaces } from '../db/schema/workspaces';

export type WorkspaceInsert = typeof workspaces.$inferInsert;

export const create = async (name: string, userId?: number) => {
    const result = await db
        .insert(workspaces)
        .values({
            name,
            createdBy: userId ?? null,
            updatedBy: userId ?? null,
        })
        .returning();
    return result[0];
};

export const updateOwner = async (id: number, userId: number) => {
    const result = await db
        .update(workspaces)
        .set({ createdBy: userId, updatedBy: userId })
        .where(eq(workspaces.id, id))
        .returning();
    return result[0];
};

export const getById = async (id: number) => {
    const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    return result[0];
};

export const remove = async (id: number) => {
    const result = await db.delete(workspaces).where(eq(workspaces.id, id)).returning();
    return result[0];
};
