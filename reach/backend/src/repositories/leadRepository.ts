import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { leads } from '../db/schema/leads';

export type LeadInsert = typeof leads.$inferInsert;

export const listByWorkspaceId = async (workspaceId: number) => {
    return await db
        .select()
        .from(leads)
        .where(eq(leads.workspaceId, workspaceId))
        .orderBy(desc(leads.createdAt));
};

export const create = async (data: LeadInsert) => {
    const result = await db.insert(leads).values(data).returning();
    return result[0];
};
