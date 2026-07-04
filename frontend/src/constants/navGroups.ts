import {
    IconAddressBook,
    IconHeadset,
    IconHistory,
    IconLayersLinked,
    IconLayoutDashboard,
    IconMessage,
    IconPackage,
    IconPhone,
    IconSettings,
    IconUsers,
    type Icon,
} from '@tabler/icons-react';

export type NavItem = { title: string; url: string; icon: Icon };

export type NavSection = 'Sales' | 'Administration' | 'Operations';

export const DEFAULT_NAV_SECTION: NavSection = 'Operations';

export const NAV_SECTIONS: NavSection[] = ['Operations', 'Sales', 'Administration'];

export const navGroups: Record<NavSection, NavItem[]> = {
    Sales: [
        { title: 'Leads', url: '/leads', icon: IconAddressBook },
        { title: 'Batches', url: '/batches', icon: IconLayersLinked },
        { title: 'Products', url: '/products', icon: IconPackage },
    ],
    Administration: [
        { title: 'Users', url: '/users', icon: IconUsers },
        { title: 'Pilots', url: '/pilots', icon: IconHeadset },
        { title: 'Settings', url: '/settings', icon: IconSettings },
    ],
    Operations: [
        { title: 'Dashboard', url: '/', icon: IconLayoutDashboard },
        { title: 'Dialer', url: '/dialer', icon: IconPhone },
        { title: 'Messages', url: '/messages', icon: IconMessage },
        { title: 'Call Logs', url: '/call-logs', icon: IconHistory },
    ],
};

export function getFirstPathForSection(section: NavSection): string {
    return navGroups[section][0].url;
}

export function getSectionForPath(pathname: string): NavSection | null {
    for (const section of NAV_SECTIONS) {
        if (navGroups[section].some(item => pathname === item.url)) {
            return section;
        }
    }
    return null;
}
