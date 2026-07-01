'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Users,
    PhoneCall,
    Calendar,
    Target,
    Heart,
    CheckCircle2,
    BarChart,
} from 'lucide-react';

export default function DashboardPage() {
    const metrics = [
        { title: 'AI Recruiters', value: '2', change: '', icon: Users, color: 'bg-blue-50 text-blue-700' },
        { title: 'Live Calls', value: '3', change: '', icon: PhoneCall, color: 'bg-emerald-50 text-emerald-700' },
        { title: 'Ongoing Conversations', value: '5', change: '', icon: Calendar, color: 'bg-purple-50 text-purple-700' },
        { title: 'Closed AI calls', value: '2', change: '', icon: Calendar, color: 'bg-purple-50 text-purple-700' },
    ];

    const avgMetrics = [
        { title: 'Avg Match Score', value: '84%', icon: Target, color: 'text-indigo-600' },
        { title: 'Avg Interest Rate', value: '72%', icon: Heart, color: 'text-rose-600' },
        { title: 'Avg Eligibility', value: '65%', icon: CheckCircle2, color: 'text-emerald-600' },
        { title: 'Avg Screening Rate', value: '91%', icon: BarChart, color: 'text-amber-600' },
    ];

    return (
        <main className="min-h-screen">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-3">
                {metrics.map((metric, idx) => (
                    <Card key={idx} className="bg-white border rounded-none h-full shadow-none">
                        <CardContent>
                            <div className="text-3xl text-slate-900 tracking-tighter">
                                {metric.value}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest flex items-center gap-2">
                                <metric.icon className="h-3 w-3" />
                                {metric.title}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <div className="mb-8">
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {avgMetrics.map((metric, idx) => (
                        <Card key={idx} className="border border-slate-200 rounded-none h-full shadow-none">
                            <CardContent>
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="text-2xl text-slate-900 tracking-tighter">
                                        {metric.value}
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest relative z-10 flex items-center gap-2">
                                    <metric.icon className="h-3 w-3" />
                                    {metric.title}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>
        </main>
    );
}