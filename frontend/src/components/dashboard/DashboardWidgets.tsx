'use client';

import Link from 'next/link';
import {
    IconCheck,
    IconCreditCard,
    IconReceipt,
    IconRefresh,
    IconSparkles,
    IconWallet,
} from '@tabler/icons-react';

import {
    departmentSpending,
    pendingApprovals,
    recentActivity,
    recentExpenses,
    topVendors,
    upcomingRenewals,
    type ActivityItem,
} from '@/data/dashboardMock';
import { formatINR } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

function WidgetShell({
    title,
    href,
    children,
    className,
}: {
    title: string;
    href?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col rounded-2xl border border-neutral-200/80 bg-white shadow-sm',
                'transition-shadow duration-200 hover:shadow-md',
                className
            )}
        >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
                <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
                {href ? (
                    <Link href={href} className="text-xs font-medium text-[#492FA6] hover:underline">
                        View all
                    </Link>
                ) : null}
            </div>
            <div className="flex-1 px-5 py-3">{children}</div>
        </div>
    );
}

function statusStyles(status: string) {
    if (status === 'approved') return 'bg-emerald-50 text-emerald-700';
    if (status === 'pending') return 'bg-amber-50 text-amber-700';
    return 'bg-rose-50 text-rose-700';
}

function priorityDot(priority: string) {
    if (priority === 'high') return 'bg-rose-500';
    if (priority === 'medium') return 'bg-amber-500';
    return 'bg-neutral-300';
}

function activityIcon(type: ActivityItem['type']) {
    switch (type) {
        case 'approval':
            return IconCheck;
        case 'budget':
            return IconWallet;
        case 'card':
            return IconCreditCard;
        case 'subscription':
            return IconRefresh;
        default:
            return IconReceipt;
    }
}

export default function DashboardWidgets() {
    const topDepartments = [...departmentSpending].sort((a, b) => b.spend - a.spend).slice(0, 5);

    return (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <WidgetShell title="Recent Expenses" href="/expenses">
                <ul className="divide-y divide-neutral-100">
                    {recentExpenses.map(expense => (
                        <li key={expense.id} className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-1">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-neutral-900">{expense.merchant}</p>
                                <p className="mt-0.5 text-xs text-neutral-500">
                                    {expense.category} · {expense.department}
                                </p>
                                <p className="mt-0.5 text-[11px] text-neutral-400">{expense.date}</p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold tabular-nums text-neutral-900">
                                    {formatINR(expense.amount)}
                                </p>
                                <span
                                    className={cn(
                                        'mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize',
                                        statusStyles(expense.status)
                                    )}
                                >
                                    {expense.status}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </WidgetShell>

            <WidgetShell title="Pending Approvals" href="/approvals">
                <ul className="divide-y divide-neutral-100">
                    {pendingApprovals.map(item => (
                        <li key={item.id} className="flex items-start gap-3 py-3 first:pt-1 last:pb-1">
                            <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', priorityDot(item.priority))} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-neutral-900">{item.title}</p>
                                <p className="mt-0.5 text-xs text-neutral-500">
                                    {item.requester} · {item.submittedAt}
                                </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
                                {formatINR(item.amount)}
                            </p>
                        </li>
                    ))}
                </ul>
            </WidgetShell>

            <WidgetShell title="Upcoming Subscription Renewals" href="/subscriptions">
                <ul className="divide-y divide-neutral-100">
                    {upcomingRenewals.map(sub => (
                        <li key={sub.id} className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-1">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-neutral-900">{sub.name}</p>
                                <p className="mt-0.5 text-xs text-neutral-500">
                                    {sub.vendor} · {sub.seats} seats
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold tabular-nums text-neutral-900">
                                    {formatINR(sub.amount)}
                                </p>
                                <p className="mt-0.5 text-[11px] text-neutral-400">Renews {sub.renewsOn}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </WidgetShell>

            <WidgetShell title="Top Vendors" href="/vendors">
                <ul className="space-y-3 py-1">
                    {topVendors.map(vendor => (
                        <li key={vendor.name}>
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-neutral-900">{vendor.name}</p>
                                    <p className="text-[11px] text-neutral-400">{vendor.category}</p>
                                </div>
                                <p className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
                                    {formatINR(vendor.amount)}
                                </p>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                                <div
                                    className="h-full rounded-full bg-[#492FA6]"
                                    style={{ width: `${vendor.share * 4}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </WidgetShell>

            <WidgetShell title="Highest Spending Departments" href="/budgets">
                <ul className="space-y-3.5 py-1">
                    {topDepartments.map(dept => {
                        const pct = Math.min(100, Math.round((dept.spend / dept.budget) * 100));
                        const over = dept.spend > dept.budget;
                        return (
                            <li key={dept.name}>
                                <div className="mb-1.5 flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-neutral-900">{dept.name}</p>
                                    <p className="text-xs tabular-nums text-neutral-500">
                                        {formatINR(dept.spend)}
                                        <span className="text-neutral-400"> / {formatINR(dept.budget)}</span>
                                    </p>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                                    <div
                                        className={cn('h-full rounded-full', over ? 'bg-rose-500' : 'bg-[#492FA6]')}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className={cn('mt-1 text-[11px]', over ? 'text-rose-600' : 'text-neutral-400')}>
                                    {pct}% of budget{over ? ' · over' : ''}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            </WidgetShell>

            <WidgetShell title="Recent Activity Timeline">
                <ul className="relative space-y-0 py-1">
                    <span className="absolute top-2 bottom-2 left-[15px] w-px bg-neutral-100" aria-hidden />
                    {recentActivity.map(item => {
                        const Icon = item.type === 'subscription' && item.actor.includes('AI') ? IconSparkles : activityIcon(item.type);
                        return (
                            <li key={item.id} className="relative flex gap-3 py-2.5">
                                <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#492FA6]">
                                    <Icon size={14} stroke={1.75} />
                                </span>
                                <div className="min-w-0 pt-0.5">
                                    <p className="text-sm text-neutral-800">
                                        <span className="font-medium text-neutral-900">{item.actor}</span>{' '}
                                        {item.action} {item.target}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-neutral-400">{item.time}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </WidgetShell>
        </section>
    );
}
