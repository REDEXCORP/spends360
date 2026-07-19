'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billing } from '@/requests';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toastError, toastSuccess } from '@/helpers';
import { cn } from '@/lib/utils';
import {
    IconCreditCard,
    IconExternalLink,
    IconLoader2,
    IconReceipt,
    IconUsers,
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
                {canManage && manageUrl ? (
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

            <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                    <IconUsers size={18} stroke={1.75} className="text-[#492FA6]" />
                    <h2 className="text-base font-semibold">Seats</h2>
                </div>
                <p className="text-sm text-neutral-500">
                    {data.memberCount} member{data.memberCount === 1 ? '' : 's'} · {data.userCount}{' '}
                    seats ({data.includedUsers} included)
                </p>

                <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Users</span>
                        <span className="text-sm font-semibold tabular-nums">{users}</span>
                    </div>
                    <Slider
                        min={Math.max(data.minUsers, data.memberCount)}
                        max={data.maxUsers}
                        step={1}
                        value={[users]}
                        disabled={!canManage || seatsMutation.isPending}
                        onValueChange={v => setUsers(v[0] ?? data.userCount)}
                    />
                </div>

                {canManage ? (
                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                        {data.managementUrls?.updatePaymentMethod ? (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    window.open(
                                        data.managementUrls.updatePaymentMethod!,
                                        '_blank',
                                        'noopener,noreferrer',
                                    )
                                }
                            >
                                Update payment method
                            </Button>
                        ) : null}
                        <Button
                            className="bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                            disabled={!dirty || seatsMutation.isPending}
                            onClick={() => seatsMutation.mutate(users)}
                        >
                            {seatsMutation.isPending ? (
                                <IconLoader2 size={16} className="animate-spin" />
                            ) : (
                                'Update seats'
                            )}
                        </Button>
                    </div>
                ) : (
                    <p className="mt-4 text-xs text-neutral-500">
                        {!isAdmin
                            ? 'Only workspace admins can change seats or manage billing.'
                            : !linked
                              ? 'Subscription is not linked to Paddle yet, so seats and invoices cannot load. Refresh after the webhook completes, or use Manage subscription once linked.'
                              : 'Subscription must be active to manage seats.'}
                    </p>
                )}
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
