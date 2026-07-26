import * as requestsRepository from '../repositories/requestsRepository';
import * as workspaceMembersRepository from '../repositories/workspaceMembersRepository';
import { AppError } from '../utils/AppError';

export interface CreateRequestInput {
    type?: string;
    title: string;
    description?: string;
    justification?: string;
    amount?: number;
    currency?: string;
    department?: string;
    project?: string;
    costCenter?: string;
    vendor?: string;
    category?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    tags?: string[];
    approverIds?: number[];
    assigneeId?: number;
}

const attachApprovers = async <T extends { id: number }>(requestRows: T[]) => {
    const approvers = await requestsRepository.listApproversForRequests(
        requestRows.map(request => request.id)
    );
    return requestRows.map(request => ({
        ...request,
        approvers: approvers.filter(approver => approver.requestId === request.id),
    }));
};

export const listMyRequests = async (workspaceId: number, userId: number) => {
    const requests = await requestsRepository.listByRequester(workspaceId, userId);
    return attachApprovers(requests);
};

export const listMyTasks = async (workspaceId: number, userId: number) => {
    const rows = await requestsRepository.listByAssignee(workspaceId, userId);
    const mapped = rows.map(row => ({
        ...row.request,
        requesterEmail: row.requesterEmail,
    }));
    return attachApprovers(mapped);
};

export const listMyApprovals = async (workspaceId: number, userId: number) => {
    const rows = await requestsRepository.listByApprover(workspaceId, userId);
    const approvers = await requestsRepository.listApproversForRequests(
        rows.map(row => row.request.id)
    );

    return rows.map(row => {
        const chain = approvers.filter(approver => approver.requestId === row.request.id);
        const current = chain.find(approver => approver.status === 'PENDING') ?? null;

        return {
            ...row.request,
            approvalId: row.approval.id,
            myApprovalStatus: row.approval.status,
            myApprovalPosition: row.approval.position,
            currentApproverId: current?.approverId ?? null,
            currentApproverEmail: current?.email ?? null,
            requesterEmail: row.requesterEmail,
            approvers: chain,
        };
    });
};

export const getRequestDetail = async (workspaceId: number, userId: number, requestId: number) => {
    const request = await requestsRepository.canAccessRequest(requestId, workspaceId, userId);
    if (!request) {
        throw new AppError('Request not found', 404);
    }

    const [approvers, comments] = await Promise.all([
        requestsRepository.listApproversForRequests([requestId]),
        requestsRepository.listComments(requestId),
    ]);

    const myApproval = approvers.find(approver => approver.approverId === userId) ?? null;

    return {
        ...request,
        approvers,
        comments,
        approvalId: myApproval?.id ?? null,
        myApprovalStatus: myApproval?.status ?? null,
        myApprovalPosition: myApproval?.position ?? null,
    };
};

export const addComment = async (
    workspaceId: number,
    userId: number,
    requestId: number,
    body: string
) => {
    const request = await requestsRepository.canAccessRequest(requestId, workspaceId, userId);
    if (!request) {
        throw new AppError('Request not found', 404);
    }

    const trimmed = body.trim();
    if (!trimmed) {
        throw new AppError('Comment cannot be empty', 400);
    }

    await requestsRepository.createComment({
        requestId,
        authorId: userId,
        body: trimmed,
    });

    return getRequestDetail(workspaceId, userId, requestId);
};

export const createRequest = async (
    workspaceId: number,
    userId: number,
    input: CreateRequestInput
) => {
    const approverIds = [...new Set(input.approverIds ?? [])];
    if (approverIds.length === 0) {
        throw new AppError('At least one approver is required', 400);
    }
    if (approverIds.includes(userId)) {
        throw new AppError('You cannot be an approver on your own request', 400);
    }

    const memberIds = await workspaceMembersRepository.listUserIdsByWorkspaceId(workspaceId);
    const invalidApprover = approverIds.find(id => !memberIds.includes(id));
    if (invalidApprover) {
        throw new AppError('All approvers must be members of this workspace', 400);
    }
    if (input.assigneeId != null && !memberIds.includes(input.assigneeId)) {
        throw new AppError('Assignee must be a member of this workspace', 400);
    }

    const created = await requestsRepository.create({
        workspaceId,
        requesterId: userId,
        type: input.type?.trim() || null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        justification: input.justification?.trim() || null,
        amount: input.amount != null ? String(input.amount) : null,
        currency: input.currency || 'USD',
        department: input.department?.trim() || null,
        project: input.project?.trim() || null,
        costCenter: input.costCenter?.trim() || null,
        vendor: input.vendor?.trim() || null,
        category: input.category?.trim() || null,
        priority: input.priority || 'MEDIUM',
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        assigneeId: input.assigneeId ?? null,
        tags: input.tags?.filter(tag => tag.trim().length > 0) ?? [],
    });

    await requestsRepository.createApprovers(
        approverIds.map((approverId, index) => ({
            requestId: created.id,
            approverId,
            position: index + 1,
        }))
    );

    return created;
};

export const cancelRequest = async (workspaceId: number, userId: number, requestId: number) => {
    const request = await requestsRepository.getById(requestId, workspaceId);
    if (!request) {
        throw new AppError('Request not found', 404);
    }
    if (request.requesterId !== userId) {
        throw new AppError('You can only cancel your own requests', 403);
    }
    if (request.status !== 'PENDING' && request.status !== 'IN_REVIEW') {
        throw new AppError(`A ${request.status.toLowerCase()} request cannot be cancelled`, 400);
    }
    return requestsRepository.update(requestId, { status: 'CANCELLED' });
};

export const decideApproval = async (
    workspaceId: number,
    userId: number,
    approvalId: number,
    action: 'APPROVED' | 'REJECTED',
    comment?: string
) => {
    const row = await requestsRepository.getApprovalForUser(approvalId, workspaceId, userId);
    if (!row) {
        throw new AppError('Approval not found', 404);
    }
    if (row.approval.status !== 'PENDING') {
        throw new AppError('This approval has already been completed', 400);
    }
    if (row.request.status === 'CANCELLED' || row.request.status === 'REJECTED') {
        throw new AppError('This request is no longer awaiting approval', 400);
    }

    const approvers = await requestsRepository.listApproversForRequests([row.request.id]);
    const earlierApprovers = approvers.filter(
        approver => approver.position < row.approval.position
    );
    if (earlierApprovers.some(approver => approver.status !== 'APPROVED')) {
        throw new AppError('This request is waiting for an earlier approver', 400);
    }

    const trimmedComment = comment?.trim() || null;
    if (action === 'REJECTED' && !trimmedComment) {
        throw new AppError('Please add a comment when rejecting a request', 400);
    }

    const updatedApproval = await requestsRepository.updateApproval(approvalId, {
        status: action,
        comment: trimmedComment,
    });

    if (trimmedComment) {
        await requestsRepository.createComment({
            requestId: row.request.id,
            authorId: userId,
            body: `${action === 'APPROVED' ? 'Approved' : 'Rejected'}: ${trimmedComment}`,
        });
    }

    if (action === 'REJECTED') {
        await requestsRepository.update(row.request.id, { status: 'REJECTED' });
    } else {
        const hasRemainingApprovers = approvers.some(
            approver => approver.id !== approvalId && approver.status !== 'APPROVED'
        );
        await requestsRepository.update(row.request.id, {
            status: hasRemainingApprovers ? 'IN_REVIEW' : 'APPROVED',
        });
    }

    return updatedApproval;
};
