'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navGroups } from '@/constants/navGroups';
import { useSidebarSection } from '@/context/SidebarSectionContext';
import { cn } from '@/lib/utils';

const BRAND = '#492FA6';

export function SidebarNav() {
    const pathname = usePathname();
    const { section } = useSidebarSection();
    const items = navGroups[section];

    return (
        <nav className="flex flex-col gap-0.5 px-3">
            {items.map(item => {
                const IconComp = item.icon;
                const active = pathname === item.url;

                return (
                    <Link
                        key={item.url}
                        href={item.url}
                        className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200',
                            active
                                ? 'font-medium text-white shadow-sm'
                                : 'font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        )}
                        style={active ? { backgroundColor: BRAND } : undefined}
                    >
                        <IconComp
                            size={18}
                            stroke={1.75}
                            className={cn('shrink-0', active ? 'text-white' : 'text-neutral-500')}
                        />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
