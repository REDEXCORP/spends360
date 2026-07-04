'use client';

import { useRouter } from 'next/navigation';
import { IconChevronDown } from '@tabler/icons-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    getFirstPathForSection,
    NAV_SECTIONS,
    type NavSection,
} from '@/constants/navGroups';
import { useSidebarSection } from '@/context/SidebarSectionContext';
import { cn } from '@/lib/utils';

export default function SidebarSectionSwitcher() {
    const router = useRouter();
    const { section, setSection } = useSidebarSection();

    const handleSelect = (option: NavSection) => {
        setSection(option);
        router.push(getFirstPathForSection(option));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none transition-colors hover:bg-neutral-50"
                >
                    <span>{section}</span>
                    <IconChevronDown size={16} stroke={1.75} className="shrink-0 text-neutral-400" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)]"
            >
                {NAV_SECTIONS.map(option => (
                    <DropdownMenuItem
                        key={option}
                        className={cn(
                            'cursor-pointer',
                            section === option && 'bg-[#492FA6]/10 text-[#492FA6]'
                        )}
                        onClick={() => handleSelect(option)}
                    >
                        {option}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
