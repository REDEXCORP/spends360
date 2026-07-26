'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { spendRequests, type RequestPriority, type SpendRequest } from '@/requests';
import RequestComments from '@/components/requests/RequestComments';
import {
    RequestProcessFlow,
    statusLabel,
} from '@/components/requests/RequestProcessFlow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toastError, toastSuccess } from '@/helpers';
import { cn } from '@/lib/utils';
import {
    IconArrowLeft,
    IconCheck,
    IconLoader2,
    IconX,
} from '@tabler/icons-react';

const priorityLabel: Record<RequestPriority, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
};

function formatAmount(request: SpendRequest) {
    if (!request.amount) return '—';
    const amount = Number(request.amount);
    if (!Number.isFinite(amount)) return '—';
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: request.currency,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${request.currency} ${amount.toFixed(2)}`;
    }
}

function formatDate(value: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function canReview(request: SpendRequest) {
    if (!request.approvalId || request.myApprovalStatus !== 'PENDING') return false;
    if (request.status === 'CANCELLED' || request.status === 'REJECTED' || request.status === 'APPROVED') {
        return false;
    }
    return (
        request.approvers
            ?.filter(approver => (request.myApprovalPosition ?? 0) > approver.position)
            .every(approver => approver.status === 'APPROVED') ?? true
    );
}

export default function RequestDetailPage() {
    const params = useParams<{ id: string }>();
    const requestId = Number(params.id);
    const queryClient = useQueryClient();
    const [decisionComment, setDecisionComment] = useState('');

    const { data: request, isLoading } = useQuery({
        queryKey: ['request-detail', requestId],
        queryFn: () => spendRequests.get(requestId),
        enabled: Number.isFinite(requestId),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const decisionMutation = useMutation({
        mutationFn: spendRequests.decideApproval,
        onSuccess: (_, variables) => {
            toastSuccess(
                variables.action === 'APPROVED' ? 'Request approved.' : 'Request rejected.'
            );
            setDecisionComment('');
            queryClient.invalidateQueries({ queryKey: ['request-detail', requestId] });
            queryClient.invalidateQueries({ queryKey: ['my-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
        },
        onError: error => toastError(error),
    });

    if (!Number.isFinite(requestId)) {
        return <p className="text-sm text-neutral-500">Invalid request.</p>;
    }

    if (isLoading || !request) {
        return (
            <div className="flex justify-center py-20">
                <IconLoader2 className="size-5 animate-spin text-neutral-500" />
            </div>
        );
    }

    const reviewable = canReview(request);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <Button asChild variant="ghost" size="icon" className="mt-0.5 size-9 shrink-0">
                        <Link href="/my-requests">
                            <IconArrowLeft size={18} stroke={1.75} />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                                {request.title}
                            </h1>
                            <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-600">
                                {statusLabel(request.status)}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                            {formatAmount(request)} · {priorityLabel[request.priority]} priority ·
                            Needed by {formatDate(request.dueDate)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-6">
                    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                            Request details
                        </h2>
                        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                    Requested by
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
                                    {request.requesterEmail ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                    Assigned to
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
                                    {request.assigneeEmail ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                    Submitted
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
                                    {formatDate(request.createdAt)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                    Needed by
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
                                    {formatDate(request.dueDate)}
                                </dd>
                            </div>
                        </dl>

                        {request.description ? (
                            <div className="mt-5">
                                <p className="text-xs uppercase tracking-wide text-neutral-400">
                                    Description
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                                    {request.description}
                                </p>
                            </div>
                        ) : null}

                        {request.justification ? (
                            <div className="mt-5 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
                                <p className="text-xs uppercase tracking-wide text-neutral-400">
                                    Business justification
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                                    {request.justification}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <RequestComments request={request} />
                </div>

                <div className="space-y-6">
                    <RequestProcessFlow request={request} />

                    {reviewable && request.approvalId ? (
                        <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                                Your decision
                            </h3>
                            <p className="mt-1 text-xs text-neutral-500">
                                Add a note for the requester. A comment is required to reject.
                            </p>
                            <Textarea
                                className="mt-3 min-h-24"
                                value={decisionComment}
                                onChange={event => setDecisionComment(event.target.value)}
                                placeholder="Optional for approve, required for reject..."
                            />
                            <div className="mt-3 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2 border-red-200 text-red-700 hover:bg-red-50"
                                    disabled={decisionMutation.isPending}
                                    onClick={() =>
                                        decisionMutation.mutate({
                                            approvalId: request.approvalId!,
                                            action: 'REJECTED',
                                            comment: decisionComment.trim() || undefined,
                                        })
                                    }
                                >
                                    <IconX size={16} stroke={1.75} />
                                    Reject
                                </Button>
                                <Button
                                    className={cn(
                                        'flex-1 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90'
                                    )}
                                    disabled={decisionMutation.isPending}
                                    onClick={() =>
                                        decisionMutation.mutate({
                                            approvalId: request.approvalId!,
                                            action: 'APPROVED',
                                            comment: decisionComment.trim() || undefined,
                                        })
                                    }
                                >
                                    <IconCheck size={16} stroke={1.75} />
                                    Approve
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
