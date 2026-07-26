'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spendRequests, type RequestPriority, type RequestStatus, type SpendRequest } from '@/requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toastError, toastSuccess } from '@/helpers';
import { cn } from '@/lib/utils';
import {
    IconCircleCheck,
    IconCircleX,
    IconClock,
    IconFileDescription,
    IconLoader2,
    IconPlus,
    IconSearch,
    IconX,
} from '@tabler/icons-react';

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
    PENDING: {
        label: 'Pending',
        className:
            'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    },
    IN_REVIEW: {
        label: 'In review',
        className:
            'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
    },
    APPROVED: {
        label: 'Approved',
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    REJECTED: {
        label: 'Rejected',
        className:
            'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300',
    },
    CANCELLED: {
        label: 'Cancelled',
        className:
            'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400',
    },
    COMPLETED: {
        label: 'Completed',
        className:
            'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-300',
    },
};

const priorityConfig: Record<RequestPriority, { label: string; className: string }> = {
    LOW: { label: 'Low', className: 'text-neutral-500' },
    MEDIUM: { label: 'Medium', className: 'text-blue-600 dark:text-blue-400' },
    HIGH: { label: 'High', className: 'text-orange-600 dark:text-orange-400' },
    URGENT: { label: 'Urgent', className: 'text-red-600 dark:text-red-400' },
};

const cancellableStatuses: RequestStatus[] = ['PENDING', 'IN_REVIEW'];

function formatAmount(request: SpendRequest) {
    if (request.amount == null || request.amount === '') return '—';
    const value = Number(request.amount);
    if (!Number.isFinite(value)) return '—';
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: request.currency || 'USD',
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${request.currency} ${value.toFixed(2)}`;
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

function StatusBadge({ status }: { status: RequestStatus }) {
    const config = statusConfig[status] ?? statusConfig.PENDING;
    return (
        <span
            className={cn(
                'inline-flex items-center rounded border px-2.5 py-1 text-xs font-medium',
                config.className
            )}
        >
            {config.label}
        </span>
    );
}

export default function MyRequestsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [requestToCancel, setRequestToCancel] = useState<SpendRequest | null>(null);

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['my-requests'],
        queryFn: spendRequests.listMine,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const cancelMutation = useMutation({
        mutationFn: spendRequests.cancel,
        onSuccess: () => {
            toastSuccess('Request cancelled.');
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
            setRequestToCancel(null);
        },
        onError: error => toastError(error),
    });

    const stats = useMemo(() => {
        const pending = requests.filter(
            request => request.status === 'PENDING' || request.status === 'IN_REVIEW'
        ).length;
        const approved = requests.filter(
            request => request.status === 'APPROVED' || request.status === 'COMPLETED'
        ).length;
        const rejected = requests.filter(request => request.status === 'REJECTED').length;
        return { total: requests.length, pending, approved, rejected };
    }, [requests]);

    const filteredRequests = useMemo(() => {
        const query = search.trim().toLowerCase();
        return requests.filter(request => {
            if (statusFilter !== 'all' && request.status !== statusFilter) return false;
            if (!query) return true;
            return [request.title, request.description, request.assigneeEmail]
                .filter(Boolean)
                .some(field => field!.toLowerCase().includes(query));
        });
    }, [requests, search, statusFilter]);

    const statCards = [
        { label: 'Total requests', value: stats.total, icon: IconFileDescription, accent: 'text-[#492FA6] bg-[#492FA6]/10' },
        { label: 'Pending', value: stats.pending, icon: IconClock, accent: 'text-amber-600 bg-amber-500/10' },
        { label: 'Approved', value: stats.approved, icon: IconCircleCheck, accent: 'text-emerald-600 bg-emerald-500/10' },
        { label: 'Rejected', value: stats.rejected, icon: IconCircleX, accent: 'text-red-600 bg-red-500/10' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        My Requests
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Everything you&apos;ve asked for — software, purchases, travel and more.
                    </p>
                </div>
                <Button
                    asChild
                    className="shrink-0 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                >
                    <Link href="/my-requests/new">
                        <IconPlus size={16} stroke={1.75} />
                        New request
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(card => (
                    <div
                        key={card.label}
                        className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
                    >
                        <div
                            className={cn(
                                'flex size-10 shrink-0 items-center justify-center rounded-lg',
                                card.accent
                            )}
                        >
                            <card.icon size={20} stroke={1.75} />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">{card.label}</p>
                            <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                                {isLoading ? '—' : card.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search requests..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                    />
                    <IconSearch
                        size={16}
                        stroke={1.75}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {Object.entries(statusConfig).map(([value, config]) => (
                            <SelectItem key={value} value={value}>
                                {config.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center rounded border border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-950">
                    <IconLoader2 className="h-5 w-5 animate-spin text-neutral-500" />
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded border border-dashed border-neutral-200 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#492FA6]/10 text-[#492FA6]">
                        <IconFileDescription size={28} stroke={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                        {requests.length === 0 ? 'No requests yet' : 'No matching requests'}
                    </h3>
                    <p className="mt-1 max-w-md text-sm text-neutral-500">
                        {requests.length === 0
                            ? 'Need software, hardware, travel approval or a reimbursement? Start here.'
                            : 'Try adjusting your search or filters.'}
                    </p>
                    {requests.length === 0 ? (
                        <Button
                            asChild
                            className="mt-6 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                        >
                            <Link href="/my-requests/new">
                                <IconPlus size={16} stroke={1.75} />
                                Create your first request
                            </Link>
                        </Button>
                    ) : null}
                </div>
            ) : (
                <div className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/80 hover:bg-neutral-50/80 dark:bg-neutral-900/50">
                                    <TableHead className="px-6">Request</TableHead>
                                    <TableHead className="px-6">Amount</TableHead>
                                    <TableHead className="px-6">Priority</TableHead>
                                    <TableHead className="px-6">Status</TableHead>
                                    <TableHead className="px-6">Submitted</TableHead>
                                    <TableHead className="px-6">Needed by</TableHead>
                                    <TableHead className="px-6 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map(request => {
                                    const priority =
                                        priorityConfig[request.priority] ?? priorityConfig.MEDIUM;
                                    return (
                                        <TableRow
                                            key={request.id}
                                            className="cursor-pointer hover:bg-neutral-50/80"
                                            onClick={() =>
                                                router.push(`/my-requests/${request.id}`)
                                            }
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="min-w-0 max-w-[320px]">
                                                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                                        {request.title}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                                                        {request.approvers?.length
                                                            ? `${request.approvers.filter(a => a.status === 'APPROVED').length}/${request.approvers.length} approvals${request.assigneeEmail ? ` · assigned to ${request.assigneeEmail}` : ''}`
                                                            : (request.description ?? '—')}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                                {formatAmount(request)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        'text-xs font-medium',
                                                        priority.className
                                                    )}
                                                >
                                                    {priority.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <StatusBadge status={request.status} />
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-neutral-500">
                                                {formatDate(request.createdAt)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-neutral-500">
                                                {formatDate(request.dueDate)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                {cancellableStatuses.includes(request.status) ? (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                                        onClick={event => {
                                                            event.stopPropagation();
                                                            setRequestToCancel(request);
                                                        }}
                                                    >
                                                        <IconX size={14} stroke={1.75} />
                                                        Cancel
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-neutral-600"
                                                        onClick={event => {
                                                            event.stopPropagation();
                                                            router.push(
                                                                `/my-requests/${request.id}`
                                                            );
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <AlertDialog
                open={!!requestToCancel}
                onOpenChange={open => !open && setRequestToCancel(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {requestToCancel
                                ? `"${requestToCancel.title}" will be withdrawn from the approval queue. You can submit a new request anytime.`
                                : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={cancelMutation.isPending}>
                            Keep request
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            disabled={cancelMutation.isPending}
                            onClick={() => {
                                if (requestToCancel) {
                                    cancelMutation.mutate(requestToCancel.id);
                                }
                            }}
                        >
                            {cancelMutation.isPending ? (
                                <IconLoader2 size={16} stroke={1.75} className="animate-spin" />
                            ) : (
                                'Cancel request'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
