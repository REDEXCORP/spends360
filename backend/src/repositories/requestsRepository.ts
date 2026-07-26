import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import { db } from '../db';
import { requests } from '../db/schema/requests';
import { requestApprovers } from '../db/schema/requestApprovers';
import { requestComments } from '../db/schema/requestComments';
import { users } from '../db/schema/users';

export type RequestInsert = typeof requests.$inferInsert;
export type RequestRow = typeof requests.$inferSelect;
export type RequestApproverInsert = typeof requestApprovers.$inferInsert;
export type ApprovalStatus = typeof requestApprovers.$inferSelect.status;
export type RequestCommentInsert = typeof requestComments.$inferInsert;

export const create = async (data: RequestInsert) => {
    const result = await db.insert(requests).values(data).returning();
    return result[0];
};

export const listByRequester = async (workspaceId: number, requesterId: number) => {
    const rows = await db
        .select({ request: requests, assigneeEmail: users.email })
        .from(requests)
        .leftJoin(users, eq(users.id, requests.assigneeId))
        .where(and(eq(requests.workspaceId, workspaceId), eq(requests.requesterId, requesterId)))
        .orderBy(desc(requests.createdAt));
    return rows.map(row => ({ ...row.request, assigneeEmail: row.assigneeEmail }));
};

export const listByAssignee = async (workspaceId: number, assigneeId: number) => {
    return db
        .select({
            request: requests,
            requesterEmail: users.email,
        })
        .from(requests)
        .innerJoin(users, eq(users.id, requests.requesterId))
        .where(and(eq(requests.workspaceId, workspaceId), eq(requests.assigneeId, assigneeId)))
        .orderBy(desc(requests.createdAt));
};

export const getById = async (id: number, workspaceId: number) => {
    const result = await db
        .select({
            request: requests,
            requesterEmail: users.email,
        })
        .from(requests)
        .innerJoin(users, eq(users.id, requests.requesterId))
        .where(and(eq(requests.id, id), eq(requests.workspaceId, workspaceId)))
        .limit(1);

    if (!result[0]) return null;

    let assigneeEmail: string | null = null;
    if (result[0].request.assigneeId) {
        const assignee = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, result[0].request.assigneeId))
            .limit(1);
        assigneeEmail = assignee[0]?.email ?? null;
    }

    return {
        ...result[0].request,
        requesterEmail: result[0].requesterEmail,
        assigneeEmail,
    };
};

export const update = async (id: number, data: Partial<RequestInsert>) => {
    const result = await db
        .update(requests)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(requests.id, id))
        .returning();
    return result[0];
};

export const createApprovers = async (rows: RequestApproverInsert[]) => {
    if (rows.length === 0) return [];
    return db.insert(requestApprovers).values(rows).returning();
};

export const listApproversForRequests = async (requestIds: number[]) => {
    if (requestIds.length === 0) return [];
    return db
        .select({
            id: requestApprovers.id,
            requestId: requestApprovers.requestId,
            approverId: requestApprovers.approverId,
            position: requestApprovers.position,
            status: requestApprovers.status,
            comment: requestApprovers.comment,
            actedAt: requestApprovers.actedAt,
            email: users.email,
        })
        .from(requestApprovers)
        .innerJoin(users, eq(users.id, requestApprovers.approverId))
        .where(inArray(requestApprovers.requestId, requestIds))
        .orderBy(asc(requestApprovers.position));
};

export const listByApprover = async (workspaceId: number, approverId: number) => {
    return db
        .select({
            approval: requestApprovers,
            request: requests,
            requesterEmail: users.email,
        })
        .from(requestApprovers)
        .innerJoin(requests, eq(requests.id, requestApprovers.requestId))
        .innerJoin(users, eq(users.id, requests.requesterId))
        .where(
            and(
                eq(requests.workspaceId, workspaceId),
                eq(requestApprovers.approverId, approverId)
            )
        )
        .orderBy(desc(requests.createdAt));
};

export const getApprovalForUser = async (
    approvalId: number,
    workspaceId: number,
    approverId: number
) => {
    const result = await db
        .select({
            approval: requestApprovers,
            request: requests,
        })
        .from(requestApprovers)
        .innerJoin(requests, eq(requests.id, requestApprovers.requestId))
        .where(
            and(
                eq(requestApprovers.id, approvalId),
                eq(requestApprovers.approverId, approverId),
                eq(requests.workspaceId, workspaceId)
            )
        )
        .limit(1);
    return result[0];
};

export const updateApproval = async (
    id: number,
    data: { status: ApprovalStatus; comment?: string | null }
) => {
    const result = await db
        .update(requestApprovers)
        .set({
            status: data.status,
            comment: data.comment ?? null,
            actedAt: new Date(),
        })
        .where(eq(requestApprovers.id, id))
        .returning();
    return result[0];
};

export const listComments = async (requestId: number) => {
    return db
        .select({
            id: requestComments.id,
            requestId: requestComments.requestId,
            authorId: requestComments.authorId,
            body: requestComments.body,
            createdAt: requestComments.createdAt,
            authorEmail: users.email,
        })
        .from(requestComments)
        .innerJoin(users, eq(users.id, requestComments.authorId))
        .where(eq(requestComments.requestId, requestId))
        .orderBy(asc(requestComments.createdAt));
};

export const createComment = async (data: RequestCommentInsert) => {
    const result = await db.insert(requestComments).values(data).returning();
    return result[0];
};

export const canAccessRequest = async (requestId: number, workspaceId: number, userId: number) => {
    const request = await getById(requestId, workspaceId);
    if (!request) return null;

    if (request.requesterId === userId || request.assigneeId === userId) {
        return request;
    }

    const asApprover = await db
        .select({ id: requestApprovers.id })
        .from(requestApprovers)
        .where(
            and(eq(requestApprovers.requestId, requestId), eq(requestApprovers.approverId, userId))
        )
        .limit(1);

    return asApprover[0] ? request : null;
};
