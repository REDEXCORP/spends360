'use client';

import Link from 'next/link';
import {
    IconBuilding,
    IconCircleCheck,
    IconCreditCard,
    IconPlus,
    IconReceipt,
    IconUpload,
    IconWallet,
    type Icon,
} from '@tabler/icons-react';

import { quickActions } from '@/data/dashboardMock';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, Icon> = {
    'qa-1': IconPlus,
    'qa-2': IconUpload,
    'qa-3': IconWallet,
    'qa-4': IconCircleCheck,
    'qa-5': IconBuilding,
    'qa-6': IconCreditCard,
};

export default function QuickActions() {
    return (
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#492FA6]/10 text-[#492FA6]">
                    <IconReceipt size={16} stroke={1.75} />
                </span>
                <div>
                    <h3 className="text-sm font-semibold text-neutral-900">Quick Actions</h3>
                    <p className="text-xs text-neutral-500">Common finance workflows</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {quickActions.map(action => {
                    const Icon = actionIcons[action.id] ?? IconPlus;
                    return (
                        <Link
                            key={action.id}
                            href={action.href}
                            className={cn(
                                'flex flex-col items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/60 px-3 py-4 text-center',
                                'transition-all duration-200 hover:-translate-y-0.5 hover:border-[#492FA6]/30 hover:bg-[#492FA6]/5 hover:shadow-sm'
                            )}
                        >
                            <span className="flex size-9 items-center justify-center rounded-lg bg-white text-[#492FA6] shadow-sm">
                                <Icon size={18} stroke={1.75} />
                            </span>
                            <span className="text-xs font-medium text-neutral-800">{action.label}</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
