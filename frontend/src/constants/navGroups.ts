import {
    IconBuilding,
    IconChartBar,
    IconCircleCheck,
    IconCreditCard,
    IconCurrencyDollar,
    IconFileInvoice,
    IconLayoutDashboard,
    IconReceipt,
    IconRefresh,
    IconSettings,
    IconSparkles,
    IconUsers,
    IconWallet,
    type Icon,
} from '@tabler/icons-react';

export type NavItem = { title: string; url: string; icon: Icon };

export const navItems: NavItem[] = [
    { title: 'Dashboard', url: '/', icon: IconLayoutDashboard },
    { title: 'Expenses', url: '/expenses', icon: IconReceipt },
    { title: 'Approvals', url: '/approvals', icon: IconCircleCheck },
    { title: 'Company Cards', url: '/company-cards', icon: IconCreditCard },
    { title: 'Bills', url: '/bills', icon: IconFileInvoice },
    { title: 'Vendors', url: '/vendors', icon: IconBuilding },
    { title: 'Subscriptions', url: '/subscriptions', icon: IconRefresh },
    { title: 'Employees', url: '/employees', icon: IconUsers },
    { title: 'Budgets', url: '/budgets', icon: IconWallet },
    { title: 'Reports', url: '/reports', icon: IconChartBar },
    { title: 'AI Assistant', url: '/ai-assistant', icon: IconSparkles },
    { title: 'Billing', url: '/billing', icon: IconCurrencyDollar },
    { title: 'Settings', url: '/settings', icon: IconSettings },
];
