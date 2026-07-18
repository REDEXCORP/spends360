import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema/users';
import { workspaceMembers } from '../db/schema/workspaceMembers';
import { workspaces } from '../db/schema/workspaces';

export const getUserByEmail = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await db
        .select()
        .from(users)
        .where(sql`lower(${users.email}) = ${normalizedEmail}`)
        .limit(1);
    return result[0];
};

export const getUserById = async (id: number) => {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
};

export const create = async (user: typeof users.$inferInsert) => {
    const result = await db.insert(users).values(user).returning();
    return result[0];
};

export const update = async (id: number, data: Partial<typeof users.$inferInsert>) => {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
};

export const listUsersByWorkspaceId = async (workspaceId: number) => {
    const rows = await db
        .select({ user: users, membership: workspaceMembers })
        .from(workspaceMembers)
        .innerJoin(users, eq(workspaceMembers.userId, users.id))
        .where(eq(workspaceMembers.workspaceId, workspaceId));

    return rows.map(row => ({
        ...row.user,
        role: row.membership.role,
        inviteAccepted: row.membership.inviteAccepted,
        joinedAt: row.membership.createdAt,
    }));
};

export const getUserProfileWithWorkspaces = async (id: number) => {
    return await db
        .select({
            user: users,
            workspaceMembers,
            workspaces,
        })
        .from(users)
        .leftJoin(workspaceMembers, eq(users.id, workspaceMembers.userId))
        .leftJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
        .where(eq(users.id, id))
        .orderBy(desc(workspaceMembers.isDefault), desc(workspaceMembers.createdAt));
};

export const getCurrentWorkspace = async (userId: number) => {
    const result = await db
        .select({
            userId: workspaceMembers.userId,
            role: workspaceMembers.role,
            workspaceId: workspaceMembers.workspaceId,
            isDefault: workspaceMembers.isDefault,
        })
        .from(workspaceMembers)
        .where(
            and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.inviteAccepted, true))
        )
        .orderBy(desc(workspaceMembers.isDefault), desc(workspaceMembers.createdAt))
        .limit(1);

    return result[0];
};
