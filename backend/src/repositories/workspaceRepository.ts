import { eq } from 'drizzle-orm';
import { db } from '../db';
import { workspaces } from '../db/schema/workspaces';

export const createWorkspace = async (name: string, userId: number) => {
    const result = await db.insert(workspaces).values({ name, createdBy: userId }).returning();
    return result[0];
};

export const getWorkspaceById = async (id: number) => {
    const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    return result[0];
};
