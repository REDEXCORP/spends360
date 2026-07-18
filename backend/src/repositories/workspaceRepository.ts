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

export const activateSubscription = async (
    id: number,
    data: {
        subscriptionInterval: 'month' | 'year';
        userCount: number;
        paddleSubscriptionId?: string | null;
        updatedBy?: number | null;
    }
) => {
    const result = await db
        .update(workspaces)
        .set({
            subscriptionStatus: 'active',
            subscriptionInterval: data.subscriptionInterval,
            userCount: data.userCount,
            paddleSubscriptionId: data.paddleSubscriptionId ?? null,
            updatedBy: data.updatedBy ?? null,
            updatedAt: new Date(),
        })
        .where(eq(workspaces.id, id))
        .returning();
    return result[0];
};

export const updateSubscriptionStatus = async (
    id: number,
    status: 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due' | 'paused',
    paddleSubscriptionId?: string | null
) => {
    const result = await db
        .update(workspaces)
        .set({
            subscriptionStatus: status,
            paddleSubscriptionId: paddleSubscriptionId ?? undefined,
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
