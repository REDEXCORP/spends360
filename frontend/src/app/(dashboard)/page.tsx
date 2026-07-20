'use client';

import Link from 'next/link';
import { IconAlertCircle } from '@tabler/icons-react';

import DatePicker from '@/components/ui/date-picker';
import { attentionItems } from '@/data/dashboardMock';

import AiInsightsCard from '@/components/dashboard/AiInsightsCard';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';
import KpiCards from '@/components/dashboard/KpiCards';
import QuickActions from '@/components/dashboard/QuickActions';
import SpendingCharts from '@/components/dashboard/SpendingCharts';

export default function DashboardPage() {
    return (
        <div className="space-y-6 pb-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Executive overview of spend, budgets, and financial health.
                    </p>
                </div>
                <DatePicker />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5 sm:items-center">
                    <IconAlertCircle size={18} stroke={1.75} className="mt-0.5 shrink-0 text-amber-600 sm:mt-0" />
                    <div>
                        <p className="text-sm font-medium text-amber-950">Requires your attention today</p>
                        <p className="mt-0.5 text-xs text-amber-800/80">
                            Approvals, renewals, and budget risks that need a decision.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-7 sm:pl-0">
                    {attentionItems.map(item => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 transition-colors hover:border-amber-300 hover:bg-amber-50"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            <KpiCards />
            <SpendingCharts />
            <AiInsightsCard />
            <DashboardWidgets />
            <QuickActions />
        </div>
    );
}
