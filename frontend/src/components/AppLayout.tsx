'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconLayoutSidebar, IconMenu2, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarNav } from '@/components/SidebarNav';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher';
import UserMenu from '@/components/UserMenu';
import { cn } from '@/lib/utils';
import Image from 'next/image';

function SidebarShell({ onClose }: { onClose?: () => void }) {
    return (
        <div className="flex h-full flex-col bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 px-4 pt-4">
                <div className="flex items-center gap-3 px-1">
                    <Image src="/favicon.ico" alt="Logo" width={36} height={36} className="rounded-md" />
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-neutral-900">
                            {process.env.NEXT_PUBLIC_APP_NAME}
                        </h2>
                        <p className="text-xs text-neutral-500">Ai Suite</p>
                    </div>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
                        <IconX size={20} stroke={1.75} />
                    </Button>
                )}
            </div>

            <div className="px-4 py-3">
                <WorkspaceSwitcher />
            </div>

            <ScrollArea className="flex-1 py-2">
                <SidebarNav />
            </ScrollArea>

            <div className="border-t border-neutral-100 p-3">
                <UserMenu />
            </div>
        </div>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden bg-neutral-50">
            <motion.div
                className="pointer-events-none absolute inset-0 -z-10 opacity-25"
                animate={{
                    background: [
                        'radial-gradient(circle at 50% 50%, rgba(73, 47, 166, 0.45) 0%, rgba(91, 63, 189, 0.25) 50%, rgba(0, 0, 0, 0) 100%)',
                        'radial-gradient(circle at 30% 70%, rgba(124, 95, 212, 0.4) 0%, rgba(73, 47, 166, 0.25) 50%, rgba(0, 0, 0, 0) 100%)',
                        'radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.35) 0%, rgba(73, 47, 166, 0.2) 50%, rgba(0, 0, 0, 0) 100%)',
                        'radial-gradient(circle at 50% 50%, rgba(73, 47, 166, 0.45) 0%, rgba(91, 63, 189, 0.25) 50%, rgba(0, 0, 0, 0) 100%)',
                    ],
                }}
                transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />

            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-[260px] border-r border-neutral-200 shadow-lg transition-transform duration-300 md:hidden',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarShell onClose={() => setMobileMenuOpen(false)} />
            </aside>

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-neutral-200 transition-transform duration-300 md:block',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarShell />
            </aside>

            <div
                className={cn(
                    'flex min-h-screen flex-col transition-[padding] duration-300',
                    sidebarOpen ? 'md:pl-[260px]' : 'md:pl-0'
                )}
            >
                <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-neutral-200/80 bg-white/90 px-4 backdrop-blur-md">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <IconMenu2 size={20} stroke={1.75} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <IconLayoutSidebar size={20} stroke={1.75} />
                    </Button>
                    <h1 className="flex-1 text-base font-semibold text-neutral-900">
                        {process.env.NEXT_PUBLIC_APP_NAME}
                    </h1>
                </header>
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}
