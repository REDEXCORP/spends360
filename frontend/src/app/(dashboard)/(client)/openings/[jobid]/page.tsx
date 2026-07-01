'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Briefcase,
    MapPin,
    Clock,
    Users,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    ArrowUpRight,
    Zap,
    Target
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function JobDetailPage({ params }: { params: Promise<{ jobid: string }> }) {
    const { jobid } = use(params);

    const job = {
        id: jobid,
        title: 'Senior Frontend Engineer',
        location: 'San Francisco, CA (Remote)',
        status: 'Active',
        department: 'Engineering',
        posted: '2 days ago',
        description: 'We are looking for a Senior Frontend Engineer to join our core team and help build the future of AI-driven recruitment platforms.',
        type: 'Full-time',
        hiringManager: 'Elena Rodriguez',
        salary: '$160k - $210k',
        enabledSources: [
            { name: 'LinkedIn', status: 'active', count: 421 },
            { name: 'Indeed', status: 'active', count: 312 },
            { name: 'Naukri', status: 'active', count: 289 },
            { name: 'Direct Apply', status: 'active', count: 156 },
            { name: 'Levelr', status: 'paused', count: 70 }
        ]
    };

    const candidates = [
        { id: 1, name: 'Alex Rivera', email: 'alex.r@example.com', score: '94%', status: 'Interviewing', avatar: 'AR', source: 'LinkedIn' },
        { id: 2, name: 'Sarah Chen', email: 's.chen@example.com', score: '88%', status: 'Applied', avatar: 'SC', source: 'Direct Apply' },
        { id: 3, name: 'Jordan Smyth', email: 'j.smyth@example.com', score: '82%', status: 'Screening', avatar: 'JS', source: 'Indeed' },
        { id: 4, name: 'Maya Patel', email: 'maya.p@example.com', score: '91%', status: 'Interviewing', avatar: 'MP', source: 'Naukri' },
        { id: 5, name: 'David Wilson', email: 'd.wilson@example.com', score: '76%', status: 'Applied', avatar: 'DW', source: 'Levelr' },
    ];

    return (
        <main>
            <div className="space-y-8">
                <Link href="/openings">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-900 mb-2">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Openings
                    </Button>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-white border border-slate-200 p-8 space-y-6">

                        <div className="flex justify-between items-start gap-6 flex-wrap">

                            <div className="space-y-4 max-w-3xl">

                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-slate-900">
                                        {job.title}
                                    </h1>
                                    <Badge className="bg-emerald-100 text-emerald-700 border-none">
                                        {job.status}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-5 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.department}</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {job.posted}</span>
                                    <span className="flex items-center gap-1 text-indigo-600 font-semibold"><Target className="h-4 w-4" /> {job.salary}</span>
                                </div>

                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {job.description}
                                </p>

                            </div>

                            <div className="flex flex-col gap-3 min-w-[240px]">

                                <div className="border border-slate-200 p-4 bg-slate-50 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Hiring Manager</span>
                                        <span className="font-medium">{job.hiringManager}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total Candidates</span>
                                        <span className="font-bold text-indigo-600">1,248</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 float-right">
                                    <Button variant="outline" className='w-full rounded'>
                                        Edit
                                    </Button>
                                </div>

                            </div>

                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-slate-700">
                                    Sourcing Channels
                                </h3>
                                <Button size="sm" variant="ghost" className="gap-1 text-xs">
                                    <Zap className="h-3 w-3" /> Sync
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {job.enabledSources.map((s) => (
                                    <div key={s.name} className="border p-3 bg-white hover:shadow-sm transition">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{s.name}</span>
                                            <span className="text-xs text-slate-500">{s.count}</span>
                                        </div>
                                        <div className="mt-2 text-xs">
                                            <span className={s.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}>
                                                {s.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </motion.div>

                <div className="space-y-4">

                    <div className="flex justify-between items-center flex-wrap gap-3">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Candidates ({candidates.length})
                        </h2>

                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input className="pl-9 w-[220px]" placeholder="Search..." />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200">

                        {candidates.map((c, i) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-4 border-b last:border-none hover:bg-slate-50"
                            >
                                <div className="flex items-center gap-4">

                                    <Avatar>
                                        <AvatarFallback>{c.avatar}</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {c.name}
                                            <Badge variant="secondary" className="text-xs">
                                                {c.source}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {c.email}
                                            </span>
                                            <span className="text-indigo-600 font-medium">
                                                {c.score}
                                            </span>
                                        </div>
                                    </div>

                                </div>

                                <div className="flex items-center gap-4">
                                    <Badge variant="outline">{c.status}</Badge>
                                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}

                    </div>

                </div>

            </div>
        </main>
    );
}
