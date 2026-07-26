'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { spendRequests, type ApprovalQueueItem } from '@/requests';
import { RequestProcessFlow } from '@/components/requests/RequestProcessFlow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toastError, toastSuccess } from '@/helpers';
import { cn } from '@/lib/utils';
import {
    IconCheck,
    IconCircleCheck,
    IconClock,
    IconLoader2,
    IconSearch,
    IconShieldCheck,
    IconX,
} from '@tabler/icons-react';

type ApprovalFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

function formatAmount(request: ApprovalQueueItem) {
    if (!request.amount) return 'No amount';
    const amount = Number(request.amount);
    if (!Number.isFinite(amount)) return 'No amount';

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
    if (!value) return 'No due date';
    return new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function canReview(request: ApprovalQueueItem) {
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

export default function ApprovalsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<ApprovalFilter>('all');
    const [commentsByApproval, setCommentsByApproval] = useState<Record<number, string>>({});

    const { data: approvals = [], isLoading } = useQuery({
        queryKey: ['my-approvals'],
        queryFn: spendRequests.listMyApprovals,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const decisionMutation = useMutation({
        mutationFn: spendRequests.decideApproval,
        onSuccess: (_, variables) => {
            toastSuccess(
                variables.action === 'APPROVED' ? 'Request approved.' : 'Request rejected.'
            );
            setCommentsByApproval(prev => {
                const next = { ...prev };
                delete next[variables.approvalId];
                return next;
            });
            queryClient.invalidateQueries({ queryKey: ['my-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
        },
        onError: error => toastError(error),
    });

    const filteredApprovals = useMemo(() => {
        const query = search.trim().toLowerCase();
        return approvals.filter(request => {
            if (filter !== 'all' && request.myApprovalStatus !== filter) return false;
            if (!query) return true;
            return [request.title, request.requesterEmail, request.description]
                .filter(Boolean)
                .some(value => value!.toLowerCase().includes(query));
        });
    }, [approvals, filter, search]);

    const waitingForMe = approvals.filter(request => canReview(request)).length;
    const approved = approvals.filter(request => request.myApprovalStatus === 'APPROVED').length;
    const rejected = approvals.filter(request => request.myApprovalStatus === 'REJECTED').length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    Approvals
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Requests from anyone that need your approval.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        label: 'Waiting for you',
                        value: waitingForMe,
                        icon: IconClock,
                        color: 'bg-amber-500/10 text-amber-600',
                    },
                    {
                        label: 'Approved by you',
                        value: approved,
                        icon: IconCircleCheck,
                        color: 'bg-emerald-500/10 text-emerald-600',
                    },
                    {
                        label: 'Rejected by you',
                        value: rejected,
                        icon: IconX,
                        color: 'bg-red-500/10 text-red-600',
                    },
                ].map(item => (
                    <div
                        key={item.label}
                        className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
                    >
                        <div
                            className={cn(
                                'flex size-10 items-center justify-center rounded-lg',
                                item.color
                            )}
                        >
                            <item.icon size={20} stroke={1.75} />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">{item.label}</p>
                            <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                                {isLoading ? '—' : item.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <IconSearch
                        size={16}
                        stroke={1.75}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <Input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Search by title or requester..."
                        className="pl-9"
                    />
                </div>
                <Select
                    value={filter}
                    onValueChange={value => setFilter(value as ApprovalFilter)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All my approvals</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex justify-center rounded-lg border border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-950">
                    <IconLoader2 className="size-5 animate-spin text-neutral-500" />
                </div>
            ) : filteredApprovals.length === 0 ? (
                <div className="flex flex-col items-center rounded-lg border border-dashed border-neutral-200 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#492FA6]/10 text-[#492FA6]">
                        <IconShieldCheck size={28} stroke={1.75} />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                        {approvals.length === 0
                            ? 'No approvals assigned to you'
                            : 'No matching approvals'}
                    </h2>
                    <p className="mt-1 max-w-md text-sm text-neutral-500">
                        {approvals.length === 0
                            ? 'When someone submits a request and adds you as an approver, it will show up here.'
                            : 'Try changing the search or status filter.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredApprovals.map(request => {
                        const reviewable = canReview(request);
                        const waitingForEarlier =
                            request.myApprovalStatus === 'PENDING' && !reviewable;
                        const comment = commentsByApproval[request.approvalId ?? 0] ?? '';

                        return (
                            <article
                                key={request.approvalId}
                                className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
                            >
                                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={`/my-requests/${request.id}`}
                                                className="text-base font-semibold text-neutral-900 hover:text-[#492FA6] dark:text-neutral-50"
                                            >
                                                {request.title}
                                            </Link>
                                            <span
                                                className={cn(
                                                    'rounded border px-2 py-0.5 text-xs font-medium',
                                                    reviewable
                                                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                                                        : request.myApprovalStatus === 'APPROVED'
                                                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                          : request.myApprovalStatus === 'REJECTED'
                                                            ? 'border-red-200 bg-red-50 text-red-800'
                                                            : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                                                )}
                                            >
                                                {reviewable
                                                    ? 'Needs your approval'
                                                    : waitingForEarlier
                                                      ? 'Waiting on earlier approver'
                                                      : request.myApprovalStatus === 'APPROVED'
                                                        ? 'Approved by you'
                                                        : request.myApprovalStatus === 'REJECTED'
                                                          ? 'Rejected by you'
                                                          : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Requested by {request.requesterEmail} ·{' '}
                                            {formatAmount(request)} · Needed by{' '}
                                            {formatDate(request.dueDate)}
                                        </p>

                                        {request.description ? (
                                            <p className="mt-4 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                                                {request.description}
                                            </p>
                                        ) : null}
                                        {request.justification ? (
                                            <div className="mt-4 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                                                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                                    Business justification
                                                </p>
                                                <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                                                    {request.justification}
                                                </p>
                                            </div>
                                        ) : null}

                                        {reviewable && request.approvalId ? (
                                            <div className="mt-5 space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                                    Your decision
                                                </p>
                                                <Textarea
                                                    value={comment}
                                                    onChange={event =>
                                                        setCommentsByApproval(prev => ({
                                                            ...prev,
                                                            [request.approvalId!]: event.target.value,
                                                        }))
                                                    }
                                                    placeholder="Add a comment. Required when rejecting."
                                                    className="min-h-20"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                                        disabled={decisionMutation.isPending}
                                                        onClick={() =>
                                                            decisionMutation.mutate({
                                                                approvalId: request.approvalId!,
                                                                action: 'REJECTED',
                                                                comment: comment.trim() || undefined,
                                                            })
                                                        }
                                                    >
                                                        <IconX size={16} stroke={1.75} />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        className="gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                                                        disabled={decisionMutation.isPending}
                                                        onClick={() =>
                                                            decisionMutation.mutate({
                                                                approvalId: request.approvalId!,
                                                                action: 'APPROVED',
                                                                comment: comment.trim() || undefined,
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

                                    <RequestProcessFlow request={request} />
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
