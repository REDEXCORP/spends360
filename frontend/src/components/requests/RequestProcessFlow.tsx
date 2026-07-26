'use client';

import { cn } from '@/lib/utils';
import type { RequestApprover, RequestStatus, SpendRequest } from '@/requests';
import {
    IconCheck,
    IconCircleDashed,
    IconSend,
    IconUser,
    IconX,
} from '@tabler/icons-react';

type FlowStep = {
    key: string;
    label: string;
    email: string;
    state: 'done' | 'current' | 'upcoming' | 'rejected' | 'cancelled';
    detail?: string | null;
};

function formatWhen(value: string | null | undefined) {
    if (!value) return null;
    return new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function buildSteps(request: SpendRequest): FlowStep[] {
    const approvers = [...(request.approvers ?? [])].sort(
        (a, b) => a.position - b.position
    );
    const currentApprover = approvers.find(approver => approver.status === 'PENDING');

    const submitted: FlowStep = {
        key: 'submitted',
        label: 'Submitted',
        email: request.requesterEmail ?? 'Requester',
        state: 'done',
        detail: formatWhen(request.createdAt),
    };

    const approvalSteps: FlowStep[] = approvers.map(approver => {
        if (approver.status === 'APPROVED') {
            return {
                key: `approver-${approver.id}`,
                label: `Approver ${approver.position}`,
                email: approver.email,
                state: 'done' as const,
                detail: [formatWhen(approver.actedAt), approver.comment]
                    .filter(Boolean)
                    .join(' · '),
            };
        }
        if (approver.status === 'REJECTED') {
            return {
                key: `approver-${approver.id}`,
                label: `Approver ${approver.position}`,
                email: approver.email,
                state: 'rejected' as const,
                detail: [formatWhen(approver.actedAt), approver.comment]
                    .filter(Boolean)
                    .join(' · '),
            };
        }
        if (
            request.status === 'CANCELLED' ||
            request.status === 'REJECTED' ||
            (currentApprover && currentApprover.id !== approver.id)
        ) {
            return {
                key: `approver-${approver.id}`,
                label: `Approver ${approver.position}`,
                email: approver.email,
                state:
                    request.status === 'CANCELLED'
                        ? ('cancelled' as const)
                        : currentApprover && currentApprover.position < approver.position
                          ? ('upcoming' as const)
                          : ('upcoming' as const),
                detail: null,
            };
        }
        return {
            key: `approver-${approver.id}`,
            label: `Approver ${approver.position}`,
            email: approver.email,
            state: 'current' as const,
            detail: 'Waiting for review',
        };
    });

    let finalState: FlowStep['state'] = 'upcoming';
    let finalDetail: string | null = 'Starts after final approval';
    if (request.status === 'APPROVED' || request.status === 'COMPLETED') {
        finalState = 'done';
        finalDetail = request.assigneeEmail
            ? `Assigned to ${request.assigneeEmail}`
            : 'Approved';
    } else if (request.status === 'REJECTED') {
        finalState = 'rejected';
        finalDetail = 'Rejected';
    } else if (request.status === 'CANCELLED') {
        finalState = 'cancelled';
        finalDetail = 'Cancelled';
    }

    const finalStep: FlowStep = {
        key: 'complete',
        label: request.assigneeEmail ? 'Assign & complete' : 'Complete',
        email: request.assigneeEmail ?? 'No assignee',
        state: finalState,
        detail: finalDetail,
    };

    return [submitted, ...approvalSteps, finalStep];
}

function StepIcon({ state }: { state: FlowStep['state'] }) {
    if (state === 'done') return <IconCheck size={16} stroke={2} />;
    if (state === 'rejected') return <IconX size={16} stroke={2} />;
    if (state === 'current') return <IconCircleDashed size={16} stroke={2} />;
    if (state === 'cancelled') return <IconX size={16} stroke={2} />;
    return <IconUser size={16} stroke={1.75} />;
}

const stateStyles: Record<FlowStep['state'], string> = {
    done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    current: 'border-[#492FA6]/30 bg-[#492FA6]/10 text-[#492FA6]',
    upcoming: 'border-neutral-200 bg-white text-neutral-400',
    rejected: 'border-red-200 bg-red-50 text-red-700',
    cancelled: 'border-neutral-200 bg-neutral-100 text-neutral-500',
};

const connectorStyles: Record<FlowStep['state'], string> = {
    done: 'bg-emerald-300',
    current: 'bg-[#492FA6]/40',
    upcoming: 'bg-neutral-200',
    rejected: 'bg-red-300',
    cancelled: 'bg-neutral-200',
};

export function RequestProcessFlow({ request }: { request: SpendRequest }) {
    const steps = buildSteps(request);

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-5 flex items-center gap-2">
                <IconSend size={16} stroke={1.75} className="text-[#492FA6]" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                    Process flow
                </h3>
            </div>

            <ol className="space-y-0">
                {steps.map((step, index) => (
                    <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                        {index < steps.length - 1 ? (
                            <span
                                className={cn(
                                    'absolute left-[15px] top-8 h-[calc(100%-16px)] w-px',
                                    connectorStyles[step.state]
                                )}
                            />
                        ) : null}
                        <div
                            className={cn(
                                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border',
                                stateStyles[step.state]
                            )}
                        >
                            <StepIcon state={step.state} />
                        </div>
                        <div className="min-w-0 pt-0.5">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                {step.label}
                            </p>
                            <p className="truncate text-sm text-neutral-500">{step.email}</p>
                            {step.detail ? (
                                <p className="mt-1 text-xs text-neutral-400">{step.detail}</p>
                            ) : null}
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function statusLabel(status: RequestStatus) {
    switch (status) {
        case 'PENDING':
            return 'Pending';
        case 'IN_REVIEW':
            return 'In review';
        case 'APPROVED':
            return 'Approved';
        case 'REJECTED':
            return 'Rejected';
        case 'CANCELLED':
            return 'Cancelled';
        case 'COMPLETED':
            return 'Completed';
        default:
            return status;
    }
}

export function approvalProgress(approvers: RequestApprover[] = []) {
    const approved = approvers.filter(approver => approver.status === 'APPROVED').length;
    return `${approved}/${approvers.length}`;
}
