'use client';

import type { Icon } from '@tabler/icons-react';
import {
    IconBuilding,
    IconCreditCard,
    IconFileInvoice,
    IconReceipt,
    IconRefresh,
    IconTrendingDown,
    IconTrendingUp,
    IconWallet,
} from '@tabler/icons-react';

import { dashboardKpis, type KpiMetric } from '@/data/dashboardMock';
import { cn } from '@/lib/utils';

const iconMap: Record<string, Icon> = {
    'total-spend': IconWallet,
    'month-spend': IconReceipt,
    'budget-remaining': IconWallet,
    'pending-approvals': IconFileInvoice,
    'company-cards': IconCreditCard,
    subscriptions: IconRefresh,
    vendors: IconBuilding,
    claims: IconReceipt,
};

function changeTone(metric: KpiMetric) {
    if (metric.tone === 'positive') return 'text-emerald-600';
    if (metric.tone === 'warning') return 'text-amber-600';
    if (metric.tone === 'danger') return 'text-rose-600';
    return metric.change >= 0 ? 'text-rose-600' : 'text-emerald-600';
}

function KpiCard({ metric }: { metric: KpiMetric }) {
    const Icon = iconMap[metric.id] ?? IconWallet;
    const isUp = metric.change >= 0;
    const TrendIcon = isUp ? IconTrendingUp : IconTrendingDown;

    return (
        <div
            className={cn(
                'group rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm',
                'transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md'
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    {metric.title}
                </p>
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#492FA6]/8 text-[#492FA6] transition-colors group-hover:bg-[#492FA6]/15">
                    <Icon size={16} stroke={1.75} />
                </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums">
                {metric.value}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
                <TrendIcon size={14} stroke={2} className={changeTone(metric)} />
                <span className={cn('text-xs font-medium tabular-nums', changeTone(metric))}>
                    {isUp ? '+' : ''}
                    {metric.change}
                    {metric.id === 'pending-approvals' || metric.id === 'company-cards' ? '' : '%'}
                </span>
                <span className="text-xs text-neutral-400">{metric.changeLabel}</span>
            </div>
            <p className="mt-2 text-xs text-neutral-500">{metric.subtext}</p>
        </div>
    );
}

export default function KpiCards() {
    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardKpis.map(metric => (
                <KpiCard key={metric.id} metric={metric} />
            ))}
        </section>
    );
}
