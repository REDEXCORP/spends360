import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { batches } from '../db/schema/batches';

export type BatchInsert = typeof batches.$inferInsert;

export const listByWorkspaceId = async (workspaceId: number) => {
    return await db
        .select()
        .from(batches)
        .where(eq(batches.workspaceId, workspaceId))
        .orderBy(desc(batches.createdAt));
};

export const create = async (data: BatchInsert) => {
    const result = await db.insert(batches).values(data).returning();
    return result[0];
};
