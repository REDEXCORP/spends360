'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billing } from '@/requests';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toastError, toastSuccess } from '@/helpers';
import { cn } from '@/lib/utils';
import {
    IconCreditCard,
    IconExternalLink,
    IconLoader2,
    IconMinus,
    IconPlus,
    IconReceipt,
} from '@tabler/icons-react';

function formatMoney(amount: string | null, currency: string) {
    if (!amount) return '—';
    const value = Number(amount) / 100;
    if (!Number.isFinite(value)) return amount;
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'USD',
        }).format(value);
    } catch {
        return `$${value.toFixed(2)}`;
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

export default function BillingPage() {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'ADMIN';
    const queryClient = useQueryClient();
    const [users, setUsers] = useState(5);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['billing'],
        queryFn: () => billing.get(),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (data?.userCount) setUsers(data.userCount);
    }, [data?.userCount]);

    const seatsMutation = useMutation({
        mutationFn: (next: number) => billing.updateSeats(next),
        onSuccess: () => {
            toastSuccess('Seat count updated. Proration applied by Paddle.');
            queryClient.invalidateQueries({ queryKey: ['billing'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
        onError: err => toastError(err),
    });

    const portalMutation = useMutation({
        mutationFn: () => billing.portal(),
        onSuccess: ({ url }) => {
            window.open(url, '_blank', 'noopener,noreferrer');
        },
        onError: err => toastError(err),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <IconLoader2 className="size-5 animate-spin text-neutral-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="space-y-3 py-10 text-center">
                <p className="text-sm text-destructive">Could not load billing.</p>
                <Button variant="outline" onClick={() => void refetch()}>
                    Retry
                </Button>
            </div>
        );
    }

    const dirty = users !== data.userCount;
    const linked = !!data.paddleSubscriptionId;
    const active =
        data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing';
    const canManage = isAdmin && active && linked;
    const manageUrl =
        data.portalUrl ||
        data.managementUrls?.updatePaymentMethod ||
        data.managementUrls?.cancel ||
        null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Billing</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage subscription seats, invoices, and payment methods.
                    </p>
                </div>
                {canManage ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {data.managementUrls?.updatePaymentMethod ? (
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() =>
                                    window.open(
                                        data.managementUrls.updatePaymentMethod!,
                                        '_blank',
                                        'noopener,noreferrer',
                                    )
                                }
                            >
                                Update payment method
                                <IconExternalLink size={14} stroke={1.75} />
                            </Button>
                        ) : null}
                        {manageUrl ? (
                            <Button
                                variant="outline"
                                className="gap-2"
                                disabled={portalMutation.isPending}
                                onClick={() => {
                                    if (data.portalUrl) portalMutation.mutate();
                                    else window.open(manageUrl, '_blank', 'noopener,noreferrer');
                                }}
                            >
                                {portalMutation.isPending ? (
                                    <IconLoader2 size={16} className="animate-spin" />
                                ) : (
                                    <IconCreditCard size={16} stroke={1.75} />
                                )}
                                Manage subscription
                                <IconExternalLink size={14} stroke={1.75} />
                            </Button>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {data.paddleError ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {data.paddleError}
                </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <p className="text-sm text-neutral-500">Status</p>
                    <p className="mt-1 text-lg font-semibold capitalize">{data.subscriptionStatus}</p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <p className="text-sm text-neutral-500">Plan</p>
                    <p className="mt-1 text-lg font-semibold capitalize">
                        {data.subscriptionInterval === 'year' ? 'Yearly' : 'Monthly'}
                    </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <p className="text-sm text-neutral-500">Next billing</p>
                    <p className="mt-1 text-lg font-semibold">{formatDate(data.nextBilledAt)}</p>
                </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-neutral-500">Seats</p>
                        <p className="mt-1 text-lg font-semibold">
                            {data.memberCount} member{data.memberCount === 1 ? '' : 's'} ·{' '}
                            {data.userCount} seats ({data.includedUsers} included)
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex h-10 items-center overflow-hidden rounded-lg border border-neutral-200">
                            <button
                                type="button"
                                aria-label="Decrease users"
                                disabled={
                                    !canManage ||
                                    seatsMutation.isPending ||
                                    users <= Math.max(data.minUsers, data.memberCount)
                                }
                                className="flex h-full w-10 items-center justify-center border-r border-neutral-200 hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40"
                                onClick={() =>
                                    setUsers(v =>
                                        Math.max(Math.max(data.minUsers, data.memberCount), v - 1),
                                    )
                                }
                            >
                                <IconMinus size={16} stroke={1.75} />
                            </button>
                            <input
                                type="number"
                                min={Math.max(data.minUsers, data.memberCount)}
                                max={data.maxUsers}
                                value={users}
                                disabled={!canManage || seatsMutation.isPending}
                                className="h-full w-16 border-0 bg-transparent text-center text-base font-semibold tabular-nums outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                onChange={e => {
                                    const next = Number(e.target.value);
                                    if (!Number.isFinite(next)) return;
                                    setUsers(
                                        Math.min(
                                            data.maxUsers,
                                            Math.max(
                                                Math.max(data.minUsers, data.memberCount),
                                                next,
                                            ),
                                        ),
                                    );
                                }}
                            />
                            <button
                                type="button"
                                aria-label="Increase users"
                                disabled={
                                    !canManage || seatsMutation.isPending || users >= data.maxUsers
                                }
                                className="flex h-full w-10 items-center justify-center border-l border-neutral-200 hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40"
                                onClick={() => setUsers(v => Math.min(data.maxUsers, v + 1))}
                            >
                                <IconPlus size={16} stroke={1.75} />
                            </button>
                        </div>
                        <Button
                            className="h-10 shrink-0 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                            disabled={!canManage || !dirty || seatsMutation.isPending}
                            onClick={() => seatsMutation.mutate(users)}
                        >
                            {seatsMutation.isPending ? (
                                <IconLoader2 size={16} className="animate-spin" />
                            ) : (
                                'Update seats'
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <IconReceipt size={18} stroke={1.75} className="text-[#492FA6]" />
                        <h2 className="text-base font-semibold">Invoices</h2>
                    </div>
                    {canManage && manageUrl ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-[#492FA6]"
                            onClick={() => {
                                if (data.portalUrl) portalMutation.mutate();
                                else window.open(manageUrl, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            Open Paddle portal
                            <IconExternalLink size={14} />
                        </Button>
                    ) : null}
                </div>

                {data.invoices.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-neutral-500">
                        {linked
                            ? 'No invoices found for this subscription yet.'
                            : 'Invoices appear here after the subscription is linked to Paddle.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/80 hover:bg-neutral-50/80">
                                    <TableHead className="px-6">Invoice</TableHead>
                                    <TableHead className="px-6">Date</TableHead>
                                    <TableHead className="px-6">Status</TableHead>
                                    <TableHead className="px-6">Amount</TableHead>
                                    <TableHead className="px-6 text-right">PDF</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.invoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="px-6 py-3 text-sm font-medium">
                                            {invoice.invoiceNumber ?? invoice.id}
                                        </TableCell>
                                        <TableCell className="px-6 py-3 text-sm text-neutral-500">
                                            {formatDate(invoice.billedAt)}
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded border px-2 py-0.5 text-xs font-medium capitalize',
                                                    invoice.status === 'completed' ||
                                                        invoice.status === 'paid' ||
                                                        invoice.status === 'billed'
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                        : 'border-neutral-200 bg-neutral-50 text-neutral-600',
                                                )}
                                            >
                                                {invoice.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-3 text-sm tabular-nums">
                                            {formatMoney(invoice.total, invoice.currencyCode)}
                                        </TableCell>
                                        <TableCell className="px-6 py-3 text-right">
                                            {invoice.invoicePdfUrl ? (
                                                <a
                                                    href={invoice.invoicePdfUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-[#492FA6] hover:underline"
                                                >
                                                    View
                                                    <IconExternalLink size={14} stroke={1.75} />
                                                </a>
                                            ) : (
                                                <span className="text-sm text-neutral-400">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
