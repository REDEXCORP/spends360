'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const kpiCards = [
    { title: 'Total Revenue', icon: DollarSign, color: 'text-emerald-600' },
    { title: 'Total Expenses', icon: TrendingDown, color: 'text-rose-600' },
    { title: 'Net Profit', icon: TrendingUp, color: 'text-blue-600' },
    { title: 'Cash Flow', icon: Wallet, color: 'text-amber-600' },
];

export default function DashboardPage() {
    return (
        <main className="space-y-6 p-4">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Executive Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                    Revenue, expenses, profitability, and cash flow insights will appear here.
                </p>
            </div>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map(metric => (
                    <Card key={metric.title} className="shadow-none">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-semibold tracking-tight text-muted-foreground">—</div>
                            <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <metric.icon className={`h-3 w-3 ${metric.color}`} />
                                {metric.title}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </main>
    );
}
