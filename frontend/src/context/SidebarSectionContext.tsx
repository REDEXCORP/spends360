'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_NAV_SECTION, getSectionForPath, type NavSection } from '@/constants/navGroups';

type SidebarSectionContextValue = {
    section: NavSection;
    setSection: (section: NavSection) => void;
};

const SidebarSectionContext = createContext<SidebarSectionContextValue | null>(null);

export function SidebarSectionProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [section, setSection] = useState<NavSection>(DEFAULT_NAV_SECTION);

    useEffect(() => {
        const matched = getSectionForPath(pathname);
        if (matched) {
            setSection(matched);
        }
    }, [pathname]);

    return (
        <SidebarSectionContext.Provider value={{ section, setSection }}>
            {children}
        </SidebarSectionContext.Provider>
    );
}

export function useSidebarSection() {
    const context = useContext(SidebarSectionContext);
    if (!context) {
        throw new Error('useSidebarSection must be used within SidebarSectionProvider');
    }
    return context;
}
