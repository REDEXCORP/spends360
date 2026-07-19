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

export const getByPaddleSubscriptionId = async (paddleSubscriptionId: string) => {
    const result = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.paddleSubscriptionId, paddleSubscriptionId))
        .limit(1);
    return result[0];
};

/** Sync subscription fields from Paddle webhook */
export const updateSubscription = async (
    id: number,
    data: {
        subscriptionStatus: 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due' | 'paused';
        subscriptionInterval?: 'month' | 'year';
        userCount?: number;
        paddleSubscriptionId?: string | null;
    }
) => {
    const result = await db
        .update(workspaces)
        .set({
            subscriptionStatus: data.subscriptionStatus,
            ...(data.subscriptionInterval !== undefined
                ? { subscriptionInterval: data.subscriptionInterval }
                : {}),
            ...(data.userCount !== undefined ? { userCount: data.userCount } : {}),
            ...(data.paddleSubscriptionId !== undefined
                ? { paddleSubscriptionId: data.paddleSubscriptionId }
                : {}),
            updatedAt: new Date(),
        })
        .where(eq(workspaces.id, id))
        .returning();
    return result[0];
};

export const remove = async (id: number) => {
    const result = await db.delete(workspaces).where(eq(workspaces.id, id)).returning();
    return result[0];
};
