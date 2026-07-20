import {
    IconChartBar,
    IconCircleCheck,
    IconCreditCard,
    IconCurrencyDollar,
    IconFileInvoice,
    IconLayoutDashboard,
    IconReceipt,
    IconSettings,
    IconSubtask,
    IconUsers,
    IconWallet,
    type Icon,
} from '@tabler/icons-react';

export type NavItem = { title: string; url: string; icon: Icon };

export const navItems: NavItem[] = [
    { title: 'Dashboard', url: '/', icon: IconLayoutDashboard },
    { title: 'My Requests', url: '/my-requests', icon: IconReceipt },
    { title: 'Approvals', url: '/approvals', icon: IconCircleCheck },
    { title: 'Tasks', url: '/tasks', icon: IconSubtask },
    { title: 'Cards & Accounts', url: '/cards-accounts', icon: IconCreditCard },
    { title: 'Expenses', url: '/expenses', icon: IconFileInvoice },
    { title: 'Users', url: '/users', icon: IconUsers },
    { title: 'Budget', url: '/budget', icon: IconWallet },
    { title: 'Reports', url: '/reports', icon: IconChartBar },
    { title: 'Billing', url: '/billing', icon: IconCurrencyDollar },
    { title: 'Settings', url: '/settings', icon: IconSettings },
];
