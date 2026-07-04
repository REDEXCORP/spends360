'use client';

import DatePicker from '@/components/ui/date-picker';
import {
    IconActivity,
    IconClock,
    IconMessage,
    IconMessages,
    IconPhone,
    IconUsers,
    type Icon,
} from '@tabler/icons-react';

type Metric = {
    title: string;
    value: string;
    Icon: Icon;
    subtext?: string;
    accent?: string;
};

export default function DashboardPage() {
    const primaryMetrics: Metric[] = [
        { title: 'Total Calls', value: '146', Icon: IconPhone },
        { title: 'Avg Calls / Day', value: '21', Icon: IconActivity },
        { title: 'Active Users', value: '9', Icon: IconUsers },
        { title: "Today's Calls", value: '2', Icon: IconClock, subtext: 'Calls made today' },
    ];

    const secondaryMetrics: Metric[] = [
        { title: 'Conversations', value: '0', Icon: IconMessages, accent: 'text-indigo-500' },
        { title: 'Total Messages', value: '0', Icon: IconMessage, accent: 'text-rose-500' },
        { title: 'Avg Messages / Day', value: '0', Icon: IconActivity, accent: 'text-emerald-500' },
        { title: "Today's Messages", value: '0', Icon: IconClock, accent: 'text-amber-500', subtext: 'Sent today' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-neutral-500">Overview of outreach activity and team usage.</p>
                </div>
                <DatePicker />
            </div>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {primaryMetrics.map(metric => (
                    <div
                        key={metric.title}
                        className="rounded-xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                {metric.title}
                            </p>
                            <metric.Icon size={16} stroke={1.75} className="text-neutral-400" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tracking-tighter text-neutral-900">{metric.value}</p>
                        {metric.subtext ? (
                            <p className="mt-1 text-xs text-neutral-500">{metric.subtext}</p>
                        ) : null}
                    </div>
                ))}
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {secondaryMetrics.map(metric => (
                    <div
                        key={metric.title}
                        className="rounded-xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                {metric.title}
                            </p>
                            <metric.Icon size={16} stroke={1.75} className={metric.accent ?? 'text-neutral-400'} />
                        </div>
                        <p className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">{metric.value}</p>
                        {metric.subtext ? (
                            <p className="mt-1 text-xs text-neutral-500">{metric.subtext}</p>
                        ) : null}
                    </div>
                ))}
            </section>
        </div>
    );
}
