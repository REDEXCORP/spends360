'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    Briefcase,
    ChevronDown,
    Cloud,
    CreditCard,
    FileText,
    Home,
    Layers,
    Menu,
    MessageSquare,
    PanelLeft,
    Settings,
    SuperscriptIcon,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { user } from '@/requests';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const sidebarItems = [
    {
        title: 'Dashboard',
        url: '/',
        icon: <Home />,
        isActive: true,
    },
    {
        title: 'Openings',
        url: '/openings',
        icon: <Briefcase />,
        isActive: true,
    },
    {
        title: 'Recruiters',
        icon: <SuperscriptIcon />,
        badge: '2',
        items: [
            { title: 'All', url: '/recruiters' },
            { title: 'Call Logs', url: '/recruiters/call-logs', badge: '2' },
        ],
    },
    {
        title: 'Knowledge Base',
        url: '/knowledge-base',
        icon: <FileText />,
    },
    {
        title: 'Billing',
        url: '/billing',
        icon: <CreditCard />,
    },
    {
        title: 'Settings',
        url: '/settings',
        icon: <Settings />,
    },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const pathname = usePathname();
    const { profile } = useAuth();
    const queryClient = useQueryClient();

    const updateWorkspaceMutation = useMutation({
        mutationFn: (workspaceId: string | number) => user.updateDefaultWorkspace(workspaceId),
        onSuccess: () => {
            queryClient.invalidateQueries();
            window.location.reload();
        },
    });

    const createWorkspaceMutation = useMutation({
        mutationFn: (name: string) => user.createWorkspace(name),
        onSuccess: () => {
            setIsCreatingWorkspace(false);
            setNewWorkspaceName('');
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
    });

    const handleCreateWorkspace = () => {
        if (!newWorkspaceName.trim()) return;
        createWorkspaceMutation.mutate(newWorkspaceName.trim());
    };

    const toggleExpanded = (title: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const isActiveItem = (url: string) => {
        if (url && pathname === url) return true;
        return false;
    };

    const handleCancelCreateWorkspace = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCreatingWorkspace(false);
        setNewWorkspaceName('');
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background">
            <motion.div
                className="absolute inset-0 -z-10 opacity-20"
                animate={{
                    background: [
                        'radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)',
                        'radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)',
                        'radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)',
                        'radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)',
                    ],
                }}
                transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-full flex-col border-r">
                    <div className="flex items-center justify-between p-4 pb-0">
                        <div className="flex items-center gap-3">
                            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl text-white">
                                <Image src="/logo.svg" alt="Logo" width={30} height={30} />
                            </div>
                            <div>
                                <h2 className="font-semibold"> {process.env.NEXT_PUBLIC_APP_NAME} </h2>
                                <p className="text-xs text-muted-foreground"> Ai Suite </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="px-4 py-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex w-full items-center justify-between rounded border bg-card px-3 py-2 text-sm font-medium hover:bg-muted outline-none">
                                    <div className="flex items-center gap-2 truncate">
                                        <div className="flex size-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                                            {(
                                                profile?.workspaces?.find((workspace: any) => workspace.isDefault)
                                                    ?.name ||
                                                profile?.workspaces?.[0]?.name ||
                                                'O'
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <span className="truncate">
                                            {' '}
                                            {profile?.workspaces?.find((workspace: any) => workspace.isDefault)?.name ||
                                                profile?.workspaces?.[0]?.name ||
                                                'Select Workspace'}{' '}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px]"
                                align="start"
                                sideOffset={8}
                            >
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    Workspaces
                                </DropdownMenuLabel>
                                {profile?.workspaces?.map((workspace: any) => (
                                    <DropdownMenuItem
                                        key={workspace.id}
                                        className={cn(
                                            'flex flex-col items-start gap-1 py-2 cursor-pointer',
                                            workspace.isDefault && 'bg-primary/10 text-primary'
                                        )}
                                        onClick={() => updateWorkspaceMutation.mutate(workspace.id)}
                                    >
                                        <span className="font-medium">{workspace.name}</span>
                                        <span className="text-xs text-muted-foreground">{workspace.role}</span>
                                    </DropdownMenuItem>
                                ))}
                                {!profile?.workspaces?.length && (
                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No Workspaces</div>
                                )}
                                {!isCreatingWorkspace ? (
                                    <Button
                                        variant="outline"
                                        className="rounded w-full"
                                        onClick={e => {
                                            e.preventDefault();
                                            setIsCreatingWorkspace(true);
                                        }}
                                    >
                                        <Layers className="mr-2 h-4 w-4" />
                                        Add Workspace
                                    </Button>
                                ) : (
                                    <div
                                        className="flex flex-col gap-2 p-2 pt-3 mt-1 w-full box-border border-t overflow-hidden"
                                        style={{ maxWidth: '200px' }}
                                    >
                                        <Input
                                            placeholder="Workspace Name"
                                            value={newWorkspaceName}
                                            onChange={e => setNewWorkspaceName(e.target.value)}
                                            className="h-8 text-xs w-full min-w-0"
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleCreateWorkspace();
                                            }}
                                            onClick={e => e.preventDefault()}
                                        />
                                        <div className="grid grid-cols-2 gap-2 w-full">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 px-0 text-xs w-full"
                                                onClick={e => handleCancelCreateWorkspace(e)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 px-0 text-xs w-full"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleCreateWorkspace();
                                                }}
                                                disabled={!newWorkspaceName.trim() || createWorkspaceMutation.isPending}
                                            >
                                                Create
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <ScrollArea className="flex-1 px-3 py-2">
                        <div className="space-y-1">
                            {sidebarItems.map(item => (
                                <div key={item.title} className="mb-1">
                                    <Link href={item.url ?? '#'}>
                                        <button
                                            className={cn(
                                                'flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium',
                                                isActiveItem(item.url ?? '')
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-muted'
                                            )}
                                            onClick={() => item.items && toggleExpanded(item.title)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span> {item.title} </span>
                                            </div>
                                            {item.badge && (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-auto rounded-full px-2 py-0.5 text-xs"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                            {item.items && (
                                                <ChevronDown
                                                    className={cn(
                                                        'ml-2 h-4 w-4 transition-transform',
                                                        expandedItems[item.title] ? 'rotate-180' : ''
                                                    )}
                                                />
                                            )}
                                        </button>
                                    </Link>
                                    {item.items && expandedItems[item.title] && (
                                        <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                                            {item.items.map(subItem => (
                                                <Link
                                                    key={subItem.title}
                                                    href={subItem.url}
                                                    className={cn(
                                                        'flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium',
                                                        isActiveItem(subItem.url ?? '')
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'hover:bg-muted'
                                                    )}
                                                >
                                                    {subItem.title}
                                                    {subItem.badge && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-auto rounded-full px-2 py-0.5 text-xs"
                                                        >
                                                            {subItem.badge}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="border-t p-3">
                        <div className="space-y-1">
                            <button className="flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium hover:bg-muted">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-xs shrink-0">
                                        {(profile?.username || profile?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate"> {profile?.username || profile?.name || 'User'} </span>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                    Free Trial
                                </Badge>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-full flex-col">
                    <div className="p-4 pb-0">
                        <div className="flex items-center gap-3">
                            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl text-white">
                                <Image src="/logo.svg" alt="Logo" width={30} height={30} />
                            </div>
                            <div>
                                <h2 className="font-semibold"> {process.env.NEXT_PUBLIC_APP_NAME} </h2>
                                <p className="text-xs text-muted-foreground"> Ai Suite </p>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex w-full items-center justify-between rounded border bg-card px-3 py-2 text-sm font-medium hover:bg-muted outline-none">
                                    <div className="flex items-center gap-2 truncate">
                                        <div className="flex size-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                                            {(
                                                profile?.workspaces?.find((workspace: any) => workspace.isDefault)
                                                    ?.name ||
                                                profile?.workspaces?.[0]?.name ||
                                                'O'
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <span className="truncate">
                                            {' '}
                                            {profile?.workspaces?.find((workspace: any) => workspace.isDefault)?.name ||
                                                profile?.workspaces?.[0]?.name ||
                                                'Select Workspace'}{' '}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px]"
                                align="start"
                                sideOffset={8}
                            >
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    Workspaces
                                </DropdownMenuLabel>
                                {profile?.workspaces?.map((workspace: any) => (
                                    <DropdownMenuItem
                                        key={workspace.id}
                                        className={cn(
                                            'flex flex-col items-start gap-1 py-2 cursor-pointer',
                                            workspace.isDefault && 'bg-primary/10 text-primary'
                                        )}
                                        onClick={() => updateWorkspaceMutation.mutate(workspace.id)}
                                    >
                                        <span className="font-medium">{workspace.name}</span>
                                        <span className="text-xs text-muted-foreground">{workspace.role}</span>
                                    </DropdownMenuItem>
                                ))}
                                {!profile?.workspaces?.length && (
                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No Workspaces</div>
                                )}
                                {!isCreatingWorkspace ? (
                                    <Button
                                        variant="outline"
                                        className="rounded w-full"
                                        onClick={e => {
                                            e.preventDefault();
                                            setIsCreatingWorkspace(true);
                                        }}
                                    >
                                        <Layers className="mr-2 h-4 w-4" />
                                        Add Workspace
                                    </Button>
                                ) : (
                                    <div
                                        className="flex flex-col gap-2 p-2 pt-3 mt-1 w-full box-border border-t overflow-hidden"
                                        style={{ maxWidth: '200px' }}
                                    >
                                        <Input
                                            placeholder="Workspace Name"
                                            value={newWorkspaceName}
                                            onChange={e => setNewWorkspaceName(e.target.value)}
                                            className="h-8 text-xs w-full min-w-0"
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleCreateWorkspace();
                                            }}
                                            onClick={e => e.preventDefault()}
                                        />
                                        <div className="grid grid-cols-2 gap-2 w-full">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 px-0 text-xs w-full"
                                                onClick={e => handleCancelCreateWorkspace(e)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 px-0 text-xs w-full"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleCreateWorkspace();
                                                }}
                                                disabled={!newWorkspaceName.trim() || createWorkspaceMutation.isPending}
                                            >
                                                Create
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <ScrollArea className="flex-1 px-3 py-2">
                        <div className="space-y-1">
                            {sidebarItems.map(item => (
                                <div key={item.title} className="mb-1">
                                    <Link href={item.url ?? '#'}>
                                        <button
                                            className={cn(
                                                'flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium',
                                                isActiveItem(item.url ?? '')
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-muted'
                                            )}
                                            onClick={() => item.items && toggleExpanded(item.title)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span> {item.title} </span>
                                            </div>
                                            {item.badge && (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-auto rounded-full px-2 py-0.5 text-xs"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                            {item.items && (
                                                <ChevronDown
                                                    className={cn(
                                                        'ml-2 h-4 w-4 transition-transform',
                                                        expandedItems[item.title] ? 'rotate-180' : ''
                                                    )}
                                                />
                                            )}
                                        </button>
                                    </Link>
                                    {item.items && expandedItems[item.title] && (
                                        <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                                            {item.items.map(subItem => (
                                                <Link
                                                    key={subItem.title}
                                                    href={subItem.url}
                                                    className={cn(
                                                        'flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium',
                                                        isActiveItem(subItem.url ?? '')
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'hover:bg-muted'
                                                    )}
                                                >
                                                    {subItem.title}
                                                    {subItem.badge && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-auto rounded-full px-2 py-0.5 text-xs"
                                                        >
                                                            {subItem.badge}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="border-t p-3">
                        <div className="space-y-1">
                            <button className="flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium hover:bg-muted">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-xs shrink-0">
                                        {(profile?.username || profile?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate"> {profile?.username || profile?.name || 'User'} </span>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                    Free Trial
                                </Badge>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    'min-h-screen transition-all duration-300 ease-in-out',
                    sidebarOpen ? 'md:pl-64' : 'md:pl-0'
                )}
            >
                <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <PanelLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-xl font-semibold"> {process.env.NEXT_PUBLIC_APP_NAME} </h1>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold border-primary shrink-0">
                                {(profile?.username || profile?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="p-2">{children}</main>
            </div>
        </div>
    );
}
