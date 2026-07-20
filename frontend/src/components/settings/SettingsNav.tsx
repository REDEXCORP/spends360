'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    IconBell,
    IconBuilding,
    IconPhone,
    IconSettings,
    type Icon,
} from '@tabler/icons-react';

const items: { value: string; label: string; icon: Icon }[] = [
    { value: 'general', label: 'General', icon: IconSettings },
    { value: 'notifications', label: 'Notifications', icon: IconBell },
    { value: 'workspace', label: 'Workspace', icon: IconBuilding },
];

export default function SettingsNav() {
    return (
        <aside className="w-full shrink-0 border-b border-neutral-200 bg-white lg:w-60 lg:border-b-0 lg:border-r">
            <nav className="p-4 lg:py-6">
                <TabsList className="flex h-auto w-full flex-col items-stretch gap-0.5 rounded-none border-0 bg-white p-0 shadow-none">
                    {items.map(item => {
                        const IconComp = item.icon;
                        return (
                            <TabsTrigger
                                key={item.value}
                                value={item.value}
                                className={cn(
                                    'group h-auto w-full flex-none justify-start gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-normal shadow-none transition-all duration-200',
                                    'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                                    'data-[state=active]:bg-[#492FA6] data-[state=active]:font-medium data-[state=active]:text-white data-[state=active]:shadow-md',
                                    '[&_svg]:text-neutral-500 data-[state=active]:[&_svg]:text-white',
                                    'dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-[#492FA6]'
                                )}
                            >
                                <IconComp size={18} stroke={1.75} className="shrink-0" />
                                {item.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </nav>
        </aside>
    );
}
