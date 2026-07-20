export type KpiMetric = {
    id: string;
    title: string;
    value: string;
    subtext: string;
    change: number;
    changeLabel: string;
    tone?: 'default' | 'positive' | 'warning' | 'danger';
};

export type MonthlySpendPoint = {
    month: string;
    spend: number;
    budget: number;
};

export type CashFlowPoint = {
    month: string;
    inflow: number;
    outflow: number;
};

export type CategorySlice = {
    name: string;
    value: number;
    color: string;
};

export type DepartmentSpend = {
    name: string;
    spend: number;
    budget: number;
};

export type ExpenseRow = {
    id: string;
    merchant: string;
    category: string;
    department: string;
    amount: number;
    date: string;
    status: 'approved' | 'pending' | 'rejected';
};

export type ApprovalItem = {
    id: string;
    title: string;
    requester: string;
    amount: number;
    submittedAt: string;
    priority: 'high' | 'medium' | 'low';
};

export type SubscriptionRenewal = {
    id: string;
    name: string;
    vendor: string;
    amount: number;
    renewsOn: string;
    seats: number;
};

export type VendorSpend = {
    name: string;
    category: string;
    amount: number;
    share: number;
};

export type ActivityItem = {
    id: string;
    actor: string;
    action: string;
    target: string;
    time: string;
    type: 'expense' | 'approval' | 'budget' | 'card' | 'subscription';
};

export type AiInsight = {
    id: string;
    tone: 'alert' | 'warning' | 'positive' | 'opportunity' | 'info';
    title: string;
    detail: string;
};

export type QuickAction = {
    id: string;
    label: string;
    href: string;
};

export const dashboardKpis: KpiMetric[] = [
    {
        id: 'total-spend',
        title: 'Total Spend',
        value: '₹1.84Cr',
        subtext: 'YTD across all departments',
        change: 8.2,
        changeLabel: 'vs last year',
    },
    {
        id: 'month-spend',
        title: 'This Month Spend',
        value: '₹48.6L',
        subtext: '₹1.62L spent today',
        change: -4.1,
        changeLabel: 'vs last month',
        tone: 'positive',
    },
    {
        id: 'budget-remaining',
        title: 'Budget Remaining',
        value: '₹21.4L',
        subtext: '69% of monthly budget used',
        change: -2.3,
        changeLabel: 'under plan',
        tone: 'positive',
    },
    {
        id: 'pending-approvals',
        title: 'Pending Approvals',
        value: '14',
        subtext: '₹6.8L awaiting review',
        change: 3,
        changeLabel: 'since yesterday',
        tone: 'warning',
    },
    {
        id: 'company-cards',
        title: 'Active Company Cards',
        value: '38',
        subtext: '₹12.4L card spend MTD',
        change: 2,
        changeLabel: 'new this month',
    },
    {
        id: 'subscriptions',
        title: 'Active Subscriptions',
        value: '52',
        subtext: '₹9.1L monthly run-rate',
        change: -1.8,
        changeLabel: 'vs last quarter',
        tone: 'positive',
    },
    {
        id: 'vendors',
        title: 'Vendors',
        value: '186',
        subtext: '24 paid this month',
        change: 5.4,
        changeLabel: 'vs last month',
    },
    {
        id: 'claims',
        title: 'Expense Claims',
        value: '67',
        subtext: '₹3.2L in open claims',
        change: 11.2,
        changeLabel: 'vs last month',
        tone: 'warning',
    },
];

export const monthlySpendingTrend: MonthlySpendPoint[] = [
    { month: 'Jan', spend: 3850000, budget: 4200000 },
    { month: 'Feb', spend: 4120000, budget: 4200000 },
    { month: 'Mar', spend: 3980000, budget: 4500000 },
    { month: 'Apr', spend: 4610000, budget: 4500000 },
    { month: 'May', spend: 4390000, budget: 4800000 },
    { month: 'Jun', spend: 5020000, budget: 4800000 },
    { month: 'Jul', spend: 4860000, budget: 5200000 },
];

export const cashFlowTrend: CashFlowPoint[] = [
    { month: 'Jan', inflow: 8200000, outflow: 3850000 },
    { month: 'Feb', inflow: 7900000, outflow: 4120000 },
    { month: 'Mar', inflow: 8500000, outflow: 3980000 },
    { month: 'Apr', inflow: 8100000, outflow: 4610000 },
    { month: 'May', inflow: 8700000, outflow: 4390000 },
    { month: 'Jun', inflow: 8300000, outflow: 5020000 },
    { month: 'Jul', inflow: 9100000, outflow: 4860000 },
];

export const expenseCategories: CategorySlice[] = [
    { name: 'Software', value: 1240000, color: '#492FA6' },
    { name: 'Travel', value: 860000, color: '#7C6AE8' },
    { name: 'Marketing', value: 980000, color: '#A78BFA' },
    { name: 'Cloud & Infra', value: 720000, color: '#34D399' },
    { name: 'Office', value: 410000, color: '#FBBF24' },
    { name: 'Other', value: 650000, color: '#94A3B8' },
];

export const departmentSpending: DepartmentSpend[] = [
    { name: 'Engineering', spend: 1480000, budget: 1600000 },
    { name: 'Marketing', spend: 1180000, budget: 1000000 },
    { name: 'Sales', spend: 920000, budget: 1100000 },
    { name: 'Operations', spend: 680000, budget: 750000 },
    { name: 'People', spend: 420000, budget: 500000 },
    { name: 'Finance', spend: 280000, budget: 350000 },
];

export const recentExpenses: ExpenseRow[] = [
    {
        id: 'exp-1',
        merchant: 'Amazon Web Services',
        category: 'Cloud & Infra',
        department: 'Engineering',
        amount: 284500,
        date: 'Today, 2:14 PM',
        status: 'pending',
    },
    {
        id: 'exp-2',
        merchant: 'Indigo Airlines',
        category: 'Travel',
        department: 'Sales',
        amount: 42680,
        date: 'Today, 11:02 AM',
        status: 'approved',
    },
    {
        id: 'exp-3',
        merchant: 'Notion Labs',
        category: 'Software',
        department: 'Operations',
        amount: 18900,
        date: 'Yesterday',
        status: 'approved',
    },
    {
        id: 'exp-4',
        merchant: 'LinkedIn Ads',
        category: 'Marketing',
        department: 'Marketing',
        amount: 156000,
        date: 'Yesterday',
        status: 'pending',
    },
    {
        id: 'exp-5',
        merchant: 'WeWork India',
        category: 'Office',
        department: 'Operations',
        amount: 87500,
        date: 'Jul 17',
        status: 'approved',
    },
];

export const pendingApprovals: ApprovalItem[] = [
    {
        id: 'apr-1',
        title: 'Q3 conference sponsorship',
        requester: 'Priya Mehta',
        amount: 425000,
        submittedAt: '2h ago',
        priority: 'high',
    },
    {
        id: 'apr-2',
        title: 'AWS reserved instance upgrade',
        requester: 'Arjun Nair',
        amount: 312000,
        submittedAt: '5h ago',
        priority: 'high',
    },
    {
        id: 'apr-3',
        title: 'Team offsite — Bangalore',
        requester: 'Rahul Kapoor',
        amount: 186500,
        submittedAt: 'Yesterday',
        priority: 'medium',
    },
    {
        id: 'apr-4',
        title: 'Figma Enterprise seats',
        requester: 'Sneha Iyer',
        amount: 64000,
        submittedAt: 'Yesterday',
        priority: 'low',
    },
];

export const upcomingRenewals: SubscriptionRenewal[] = [
    {
        id: 'sub-1',
        name: 'Salesforce Enterprise',
        vendor: 'Salesforce',
        amount: 245000,
        renewsOn: 'Jul 22',
        seats: 48,
    },
    {
        id: 'sub-2',
        name: 'Slack Business+',
        vendor: 'Slack',
        amount: 68200,
        renewsOn: 'Jul 25',
        seats: 120,
    },
    {
        id: 'sub-3',
        name: 'GitHub Team',
        vendor: 'GitHub',
        amount: 41500,
        renewsOn: 'Aug 01',
        seats: 86,
    },
    {
        id: 'sub-4',
        name: 'Zoom Workplace',
        vendor: 'Zoom',
        amount: 28900,
        renewsOn: 'Aug 04',
        seats: 95,
    },
];

export const topVendors: VendorSpend[] = [
    { name: 'Amazon Web Services', category: 'Cloud', amount: 1240000, share: 18 },
    { name: 'Google Cloud', category: 'Cloud', amount: 680000, share: 10 },
    { name: 'Meta Ads', category: 'Marketing', amount: 520000, share: 8 },
    { name: 'Salesforce', category: 'Software', amount: 490000, share: 7 },
    { name: 'Delta / Indigo', category: 'Travel', amount: 410000, share: 6 },
];

export const recentActivity: ActivityItem[] = [
    {
        id: 'act-1',
        actor: 'Priya Mehta',
        action: 'submitted',
        target: '₹4.25L sponsorship request',
        time: '12 min ago',
        type: 'approval',
    },
    {
        id: 'act-2',
        actor: 'System',
        action: 'flagged',
        target: 'AWS spend +12% MoM',
        time: '48 min ago',
        type: 'expense',
    },
    {
        id: 'act-3',
        actor: 'CFO Office',
        action: 'approved',
        target: 'Marketing Q3 budget revision',
        time: '2h ago',
        type: 'budget',
    },
    {
        id: 'act-4',
        actor: 'Arjun Nair',
        action: 'issued',
        target: 'Company card to Neha Shah',
        time: '3h ago',
        type: 'card',
    },
    {
        id: 'act-5',
        actor: 'Spends360 AI',
        action: 'detected',
        target: '3 unused SaaS seats',
        time: '5h ago',
        type: 'subscription',
    },
];

export const aiInsights: AiInsight[] = [
    {
        id: 'ai-1',
        tone: 'alert',
        title: 'Marketing exceeded budget by 18%',
        detail: 'Spend is ₹11.8L against a ₹10L monthly allocation. Review LinkedIn and Meta campaigns.',
    },
    {
        id: 'ai-2',
        tone: 'warning',
        title: 'AWS costs increased 12%',
        detail: 'Month-over-month cloud spend rose to ₹12.4L. Reserved capacity could cut ~₹1.5L.',
    },
    {
        id: 'ai-3',
        tone: 'positive',
        title: 'Travel spending decreased 30%',
        detail: 'Policy updates and virtual meetings reduced travel to ₹8.6L this month.',
    },
    {
        id: 'ai-4',
        tone: 'opportunity',
        title: '₹48,000 can be saved monthly',
        detail: 'Cancel or downgrade 7 unused subscriptions with zero logins in 60 days.',
    },
    {
        id: 'ai-5',
        tone: 'info',
        title: 'Three high-value expenses need approval',
        detail: 'Combined value ₹9.2L. Oldest request has been waiting over 5 hours.',
    },
];

export const quickActions: QuickAction[] = [
    { id: 'qa-1', label: 'Add Expense', href: '/expenses' },
    { id: 'qa-2', label: 'Upload Receipt', href: '/expenses' },
    { id: 'qa-3', label: 'Create Budget', href: '/budgets' },
    { id: 'qa-4', label: 'Request Approval', href: '/approvals' },
    { id: 'qa-5', label: 'Add Vendor', href: '/vendors' },
    { id: 'qa-6', label: 'Issue Company Card', href: '/company-cards' },
];

export const attentionItems = [
    { label: '14 approvals pending', href: '/approvals' },
    { label: '4 renewals in 14 days', href: '/subscriptions' },
    { label: 'Marketing over budget', href: '/budgets' },
];

export const cashBurn = {
    monthly: 4860000,
    daily: 162000,
    runwayMonths: 14.2,
    change: -3.4,
};
