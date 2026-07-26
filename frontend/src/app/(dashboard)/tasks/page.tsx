'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
import { cn } from '@/lib/utils';
import {
    IconCircleCheck,
    IconClock,
    IconLoader2,
    IconSearch,
    IconSubtask,
} from '@tabler/icons-react';

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
    PENDING: {
        label: 'Pending approval',
        className:
            'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    },
    IN_REVIEW: {
        label: 'In review',
        className:
            'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
    },
    APPROVED: {
        label: 'Ready to execute',
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

export default function TasksPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['my-tasks'],
        queryFn: spendRequests.listMyTasks,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const stats = useMemo(() => {
        const open = tasks.filter(
            task =>
                task.status === 'PENDING' ||
                task.status === 'IN_REVIEW' ||
                task.status === 'APPROVED'
        ).length;
        const ready = tasks.filter(task => task.status === 'APPROVED').length;
        const done = tasks.filter(task => task.status === 'COMPLETED').length;
        return { total: tasks.length, open, ready, done };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();
        return tasks.filter(task => {
            if (statusFilter !== 'all' && task.status !== statusFilter) return false;
            if (!query) return true;
            return [task.title, task.requesterEmail, task.description]
                .filter(Boolean)
                .some(field => field!.toLowerCase().includes(query));
        });
    }, [tasks, search, statusFilter]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Tasks</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Requests assigned to you to execute after approval.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        label: 'Assigned to you',
                        value: stats.total,
                        icon: IconSubtask,
                        accent: 'text-[#492FA6] bg-[#492FA6]/10',
                    },
                    {
                        label: 'Open',
                        value: stats.open,
                        icon: IconClock,
                        accent: 'text-amber-600 bg-amber-500/10',
                    },
                    {
                        label: 'Ready to execute',
                        value: stats.ready,
                        icon: IconCircleCheck,
                        accent: 'text-emerald-600 bg-emerald-500/10',
                    },
                    {
                        label: 'Completed',
                        value: stats.done,
                        icon: IconCircleCheck,
                        accent: 'text-violet-600 bg-violet-500/10',
                    },
                ].map(card => (
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
                        placeholder="Search assigned tasks..."
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
                    <SelectTrigger className="w-full sm:w-[180px]">
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
            ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded border border-dashed border-neutral-200 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#492FA6]/10 text-[#492FA6]">
                        <IconSubtask size={28} stroke={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                        {tasks.length === 0 ? 'No tasks assigned to you' : 'No matching tasks'}
                    </h3>
                    <p className="mt-1 max-w-md text-sm text-neutral-500">
                        {tasks.length === 0
                            ? 'When someone creates a request and assigns it to you, it will appear here.'
                            : 'Try adjusting your search or filters.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/80 hover:bg-neutral-50/80 dark:bg-neutral-900/50">
                                    <TableHead className="px-6">Task</TableHead>
                                    <TableHead className="px-6">Requested by</TableHead>
                                    <TableHead className="px-6">Amount</TableHead>
                                    <TableHead className="px-6">Priority</TableHead>
                                    <TableHead className="px-6">Status</TableHead>
                                    <TableHead className="px-6">Needed by</TableHead>
                                    <TableHead className="px-6 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTasks.map(task => {
                                    const priority =
                                        priorityConfig[task.priority] ?? priorityConfig.MEDIUM;
                                    const status = statusConfig[task.status] ?? statusConfig.PENDING;
                                    return (
                                        <TableRow
                                            key={task.id}
                                            className="cursor-pointer hover:bg-neutral-50/80"
                                            onClick={() => router.push(`/my-requests/${task.id}`)}
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="min-w-0 max-w-[320px]">
                                                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                                        {task.title}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                                                        {task.approvers?.length
                                                            ? `${task.approvers.filter(a => a.status === 'APPROVED').length}/${task.approvers.length} approvals`
                                                            : (task.description ?? '—')}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-neutral-600">
                                                {task.requesterEmail ?? '—'}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                                {formatAmount(task)}
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
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center rounded border px-2.5 py-1 text-xs font-medium',
                                                        status.className
                                                    )}
                                                >
                                                    {status.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-neutral-500">
                                                {formatDate(task.dueDate)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={event => {
                                                        event.stopPropagation();
                                                        router.push(`/my-requests/${task.id}`);
                                                    }}
                                                >
                                                    Open
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
