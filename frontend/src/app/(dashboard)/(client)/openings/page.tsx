'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Building2, MoreVertical, Plus, Search, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OpeningDrawer } from '@/components/drawers/OpeningDrawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { jobs } from '@/requests';

export default function OpeningsPage() {
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(null);

    const {
        data: openings = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['jobs'],
        queryFn: jobs.getAll,
    });

    const handleOpenDrawer = (opening?: any) => {
        setSelectedOpeningId(opening?.id || null);
        setIsDrawerOpen(true);
    };

    return (
        <main className="overflow-hidden">
            <div className="space-y-8 mt-4">
                <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded">
                        All Openings
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search openings..."
                            className="w-full rounded pl-9 md:w-[200px]"
                        />
                    </div>
                    <Button
                        className="w-fit rounded bg-black text-white hover:bg-black/90 shrink-0"
                        onClick={() => handleOpenDrawer()}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Opening
                    </Button>
                </div>

                <section className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                        {openings.map((rawOpening: any) => {
                            const opening = {
                                ...rawOpening,
                                status: rawOpening.pipelineStatus || 'Draft',
                                department: rawOpening.role || 'Engineering',
                                stages: {
                                    positions: rawOpening.openings || 1,
                                    open: rawOpening.applicants || 0,
                                    interviewing: rawOpening.interviews || 0,
                                    offered: rawOpening.offered || 0,
                                    hired: rawOpening.hired || 0,
                                },
                            };
                            return (
                                <Card
                                    key={opening.id}
                                    className="overflow-hidden rounded border cursor-pointer hover:border-slate-900 transition-colors"
                                    onClick={() => router.push(`/openings/${opening.id}`)}
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg leading-tight">{opening.title}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="rounded">
                                                    {opening.status}
                                                </Badge>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="default" size="sm" className="rounded">
                                                                Action
                                                                <MoreVertical className="ml-1" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>Draft</DropdownMenuItem>
                                                            <DropdownMenuItem>Start</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive">Close</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                        <CardDescription className="flex items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            {opening.department} • {opening.location}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                                    Pipeline Status
                                                </span>
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100/50">
                                                    {(() => {
                                                        const stages = [
                                                            'positions',
                                                            'open',
                                                            'interviewing',
                                                            'offered',
                                                            'hired',
                                                        ] as const;
                                                        const sData = opening.stages as Record<string, number>;
                                                        const furthestIdx = stages.reduce(
                                                            (acc, s, idx) => (sData[s] > 0 ? idx : acc),
                                                            0
                                                        );
                                                        const labels = [
                                                            'Opening',
                                                            'Hiring',
                                                            'Interviewing',
                                                            'Offered',
                                                            'Closed',
                                                        ];
                                                        return labels[furthestIdx];
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="relative h-6 flex items-center mb-1">
                                                <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-muted rounded-full" />
                                                {(() => {
                                                    const stages = [
                                                        'positions',
                                                        'open',
                                                        'interviewing',
                                                        'offered',
                                                        'hired',
                                                    ] as const;
                                                    const sData = opening.stages as Record<string, number>;
                                                    const furthestIndex = stages.reduce(
                                                        (acc, stage, idx) => (sData[stage] > 0 ? idx : acc),
                                                        0
                                                    );
                                                    const progress = (furthestIndex / (stages.length - 1)) * 100;
                                                    return (
                                                        <div
                                                            className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-in-out -translate-y-1/2 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    );
                                                })()}
                                                <div className="relative z-10 flex w-full justify-between items-center px-0.5">
                                                    {(
                                                        [
                                                            'positions',
                                                            'open',
                                                            'interviewing',
                                                            'offered',
                                                            'hired',
                                                        ] as const
                                                    ).map((stage, idx) => {
                                                        const sArr = [
                                                            'positions',
                                                            'open',
                                                            'interviewing',
                                                            'offered',
                                                            'hired',
                                                        ] as const;
                                                        const sData = opening.stages as Record<string, number>;
                                                        const furthestIndex = sArr.reduce(
                                                            (acc, s, i) => (sData[s] > 0 ? i : acc),
                                                            0
                                                        );
                                                        const isActive = idx <= furthestIndex;
                                                        const isCurrent = idx === furthestIndex;

                                                        return (
                                                            <div
                                                                key={stage}
                                                                className="relative flex items-center justify-center"
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        'h-3 w-3 rounded-full border-2 transition-all duration-500',
                                                                        isActive
                                                                            ? 'border-blue-500 bg-white shadow-sm'
                                                                            : 'border-muted bg-background'
                                                                    )}
                                                                >
                                                                    {isCurrent && (
                                                                        <div className="absolute inset-0 h-3 w-3 rounded-full bg-blue-500 animate-ping opacity-25" />
                                                                    )}
                                                                    {isActive && (
                                                                        <div
                                                                            className={cn(
                                                                                'h-full w-full rounded-full',
                                                                                isCurrent
                                                                                    ? 'bg-blue-600'
                                                                                    : 'bg-blue-400'
                                                                            )}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-5 text-[10px] text-center text-muted-foreground font-medium">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-foreground">{opening.stages.positions}</span>
                                                    <span>Openings</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5 border-l">
                                                    <span className="text-foreground">{opening.stages.open}</span>
                                                    <span>Applicants</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5 border-l">
                                                    <span className="text-foreground">
                                                        {opening.stages.interviewing}
                                                    </span>
                                                    <span>Interview</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5 border-l">
                                                    <span className="text-foreground">{opening.stages.offered}</span>
                                                    <span>Offered</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5 border-l">
                                                    <span className="text-foreground">{opening.stages.hired}</span>
                                                    <span>Hired</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-dashed">
                                            <div className="flex items-center">
                                                <Users className="mr-1.5 h-4 w-4 text-primary/70" />
                                                {opening.applicants} candidates
                                            </div>
                                            <div className="flex items-center">
                                                <Briefcase className="mr-1.5 h-4 w-4 text-primary/70" />
                                                {opening.type}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    {openings.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                                <Briefcase className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold">No job openings yet</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                                Create your first opening to attract talent.
                            </p>
                            <Button className="gap-2 rounded" onClick={() => handleOpenDrawer()}>
                                <Plus className="h-4 w-4" />
                                Add Opening
                            </Button>
                        </div>
                    )}
                </section>
            </div>

            <OpeningDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                opening={openings.find((o: any) => o.id === selectedOpeningId)}
                onSaveSuccess={() => refetch()}
            />
        </main>
    );
}
