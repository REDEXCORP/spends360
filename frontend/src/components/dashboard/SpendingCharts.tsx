'use client';

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import {
    cashFlowTrend,
    departmentSpending,
    expenseCategories,
    monthlySpendingTrend,
} from '@/data/dashboardMock';
import { formatINR, formatINRCompact } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

type ChartCardProps = {
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
};

function ChartCard({ title, description, children, className }: ChartCardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm',
                'transition-shadow duration-200 hover:shadow-md',
                className
            )}
        >
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
                <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
            </div>
            <div className="h-[240px] w-full">{children}</div>
        </div>
    );
}

function CurrencyTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ name?: string; value?: number; color?: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg">
            {label ? <p className="mb-1 text-xs font-medium text-neutral-500">{label}</p> : null}
            {payload.map(entry => (
                <p key={entry.name} className="text-xs text-neutral-800 tabular-nums">
                    <span className="mr-2 inline-block size-2 rounded-full" style={{ background: entry.color }} />
                    {entry.name}: {formatINR(entry.value ?? 0)}
                </p>
            ))}
        </div>
    );
}

export default function SpendingCharts() {
    return (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-6">
            <ChartCard
                title="Monthly Spending Trend"
                description="Spend vs budget over the last 7 months"
                className="xl:col-span-3"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySpendingTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#492FA6" stopOpacity={0.28} />
                                <stop offset="100%" stopColor="#492FA6" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#A3A3A3', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                            tickFormatter={v => formatINRCompact(v)}
                            tick={{ fill: '#A3A3A3', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={56}
                        />
                        <Tooltip content={<CurrencyTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={28}
                            iconType="circle"
                            wrapperStyle={{ fontSize: 11, color: '#737373' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="budget"
                            name="Budget"
                            stroke="#CBD5E1"
                            strokeDasharray="4 4"
                            fill="transparent"
                            strokeWidth={1.5}
                        />
                        <Area
                            type="monotone"
                            dataKey="spend"
                            name="Spend"
                            stroke="#492FA6"
                            fill="url(#spendFill)"
                            strokeWidth={2.25}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard
                title="Budget vs Actual"
                description="Department utilization this month"
                className="xl:col-span-3"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={departmentSpending}
                        layout="vertical"
                        margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                        <XAxis
                            type="number"
                            tickFormatter={v => formatINRCompact(v)}
                            tick={{ fill: '#A3A3A3', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={88}
                            tick={{ fill: '#525252', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(73, 47, 166, 0.04)' }} />
                        <Legend
                            verticalAlign="top"
                            height={28}
                            iconType="circle"
                            wrapperStyle={{ fontSize: 11, color: '#737373' }}
                        />
                        <Bar dataKey="budget" name="Budget" fill="#E5E7EB" radius={[0, 4, 4, 0]} barSize={10} />
                        <Bar dataKey="spend" name="Actual" fill="#492FA6" radius={[0, 4, 4, 0]} barSize={10} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard
                title="Expense Categories"
                description="Where money went this month"
                className="xl:col-span-2"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={expenseCategories}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={3}
                            strokeWidth={0}
                        >
                            {expenseCategories.map(entry => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const entry = payload[0];
                                return (
                                    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg">
                                        <p className="text-xs text-neutral-800 tabular-nums">
                                            {entry.name}: {formatINR(Number(entry.value ?? 0))}
                                        </p>
                                    </div>
                                );
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            iconType="circle"
                            wrapperStyle={{ fontSize: 11, color: '#737373' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard
                title="Department Spending"
                description="Highest spenders this month"
                className="xl:col-span-2"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentSpending} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#A3A3A3', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            angle={-18}
                            textAnchor="end"
                            height={48}
                        />
                        <YAxis
                            tickFormatter={v => formatINRCompact(v)}
                            tick={{ fill: '#A3A3A3', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={52}
                        />
                        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(73, 47, 166, 0.04)' }} />
                        <Bar dataKey="spend" name="Spend" fill="#7C6AE8" radius={[6, 6, 0, 0]} barSize={22} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard
                title="Cash Flow Trend"
                description="Inflows vs outflows · burn visible"
                className="xl:col-span-2"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34D399" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#34D399" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="outflowFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#A3A3A3', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                            tickFormatter={v => formatINRCompact(v)}
                            tick={{ fill: '#A3A3A3', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={52}
                        />
                        <Tooltip content={<CurrencyTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={28}
                            iconType="circle"
                            wrapperStyle={{ fontSize: 11, color: '#737373' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="inflow"
                            name="Inflow"
                            stroke="#10B981"
                            fill="url(#inflowFill)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="outflow"
                            name="Outflow"
                            stroke="#F43F5E"
                            fill="url(#outflowFill)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>
        </section>
    );
}
