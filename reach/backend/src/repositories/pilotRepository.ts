import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { pilots } from '../db/schema/pilots';

export type PilotInsert = typeof pilots.$inferInsert;

export const listByWorkspaceId = async (workspaceId: number) => {
    return await db
        .select()
        .from(pilots)
        .where(eq(pilots.workspaceId, workspaceId))
        .orderBy(desc(pilots.createdAt));
};

export const create = async (data: PilotInsert) => {
    const result = await db.insert(pilots).values(data).returning();
    return result[0];
};
