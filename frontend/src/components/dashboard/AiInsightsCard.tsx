'use client';

import Link from 'next/link';
import {
    IconAlertTriangle,
    IconArrowDownRight,
    IconBulb,
    IconInfoCircle,
    IconSparkles,
    IconTrendingDown,
} from '@tabler/icons-react';

import { aiInsights, cashBurn, type AiInsight } from '@/data/dashboardMock';
import { formatChange, formatINR } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

function toneStyles(tone: AiInsight['tone']) {
    switch (tone) {
        case 'alert':
            return {
                wrap: 'border-rose-100 bg-rose-50/60',
                icon: 'bg-rose-100 text-rose-600',
                Icon: IconAlertTriangle,
            };
        case 'warning':
            return {
                wrap: 'border-amber-100 bg-amber-50/60',
                icon: 'bg-amber-100 text-amber-600',
                Icon: IconAlertTriangle,
            };
        case 'positive':
            return {
                wrap: 'border-emerald-100 bg-emerald-50/60',
                icon: 'bg-emerald-100 text-emerald-600',
                Icon: IconTrendingDown,
            };
        case 'opportunity':
            return {
                wrap: 'border-violet-100 bg-[#492FA6]/5',
                icon: 'bg-[#492FA6]/10 text-[#492FA6]',
                Icon: IconBulb,
            };
        default:
            return {
                wrap: 'border-sky-100 bg-sky-50/60',
                icon: 'bg-sky-100 text-sky-600',
                Icon: IconInfoCircle,
            };
    }
}

export default function AiInsightsCard() {
    return (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm xl:col-span-2">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-[#492FA6]/10 text-[#492FA6]">
                            <IconSparkles size={18} stroke={1.75} />
                        </span>
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900">AI Insights</h3>
                            <p className="text-xs text-neutral-500">Cost signals and savings opportunities</p>
                        </div>
                    </div>
                    <Link href="/ai-assistant" className="text-xs font-medium text-[#492FA6] hover:underline">
                        Open assistant
                    </Link>
                </div>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                    {aiInsights.map(insight => {
                        const tone = toneStyles(insight.tone);
                        return (
                            <li
                                key={insight.id}
                                className={cn(
                                    'rounded-xl border p-3.5 transition-colors hover:border-neutral-300',
                                    tone.wrap
                                )}
                            >
                                <div className="flex gap-3">
                                    <span
                                        className={cn(
                                            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg',
                                            tone.icon
                                        )}
                                    >
                                        <tone.Icon size={14} stroke={1.75} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-neutral-900">{insight.title}</p>
                                        <p className="mt-1 text-xs leading-relaxed text-neutral-600">{insight.detail}</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-white to-[#492FA6]/[0.04] p-5 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#492FA6]/10 text-[#492FA6]">
                        <IconArrowDownRight size={18} stroke={1.75} />
                    </span>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Cash Burn</h3>
                        <p className="text-xs text-neutral-500">Current operating burn rate</p>
                    </div>
                </div>

                <p className="mt-6 text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums">
                    {formatINR(cashBurn.monthly)}
                    <span className="ml-1 text-sm font-medium text-neutral-400">/ mo</span>
                </p>
                <p className="mt-1 text-xs text-emerald-600">{formatChange(cashBurn.change)} vs last month</p>

                <dl className="mt-6 space-y-3 border-t border-neutral-100 pt-4">
                    <div className="flex items-center justify-between">
                        <dt className="text-xs text-neutral-500">Daily burn</dt>
                        <dd className="text-sm font-semibold tabular-nums text-neutral-900">
                            {formatINR(cashBurn.daily)}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="text-xs text-neutral-500">Estimated runway</dt>
                        <dd className="text-sm font-semibold tabular-nums text-neutral-900">
                            {cashBurn.runwayMonths} months
                        </dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="text-xs text-neutral-500">Budget used (MTD)</dt>
                        <dd className="text-sm font-semibold tabular-nums text-neutral-900">69%</dd>
                    </div>
                </dl>
            </div>
        </section>
    );
}
