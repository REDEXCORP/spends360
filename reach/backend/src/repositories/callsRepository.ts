import { eq } from "drizzle-orm";
import { db } from "../db";
import { calls } from "../db/schema/calls";

export const create = async (call: typeof calls.$inferInsert) => {
    const result = await db.insert(calls).values(call).returning();
    return result[0];
};

export const callsList = async (workspaceId: number) => {
    const result = await db.select().from(calls).where(eq(calls.workspaceId, workspaceId));
    return result;
};
