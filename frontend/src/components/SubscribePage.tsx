'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { user, type WorkspaceSummary } from '@/requests';
import { useAuth } from '@/context/AuthContext';
import { IconChevronDown } from '@tabler/icons-react';

const PADDLE_TOKEN = 'test_53059d4dc2c56f50985d465efd5';
const PRICES = {
    monthly: { base: 'pri_01kxt4ejrmq9tm7jw5jda2h4pn', seat: 'pri_01kxt4m9c0e7d3rtxgnjhn7gde' },
    yearly: { base: 'pri_01kxt4nr8y9jehazc92yv82tqk', seat: 'pri_01kxt4pdvfn2m46qdt7qqbt1mk' },
} as const;
const RATES = { monthly: { base: 9.99, seat: 1 }, yearly: { base: 95.99, seat: 10 } };
const INCLUDED = 5;

export default function SubscribePage() {
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const workspaces: WorkspaceSummary[] = profile?.workspaces ?? [];

    const [workspaceId, setWorkspaceId] = useState(
        () =>
            profile?.workspaceId ??
            workspaces.find(w => w.isDefault)?.id ??
            workspaces[0]?.id,
    );
    const [yearly, setYearly] = useState(true);
    const [users, setUsers] = useState(5);
    const [paddle, setPaddle] = useState<Paddle | null>(null);
    const [loading, setLoading] = useState(false);

    const selected = workspaces.find(w => w.id === workspaceId);
    const period = yearly ? 'yearly' : 'monthly';
    const extra = Math.max(0, users - INCLUDED);
    const total = RATES[period].base + extra * RATES[period].seat;

    const switchMutation = useMutation({
        mutationFn: (id: number) => user.switchWorkspace(id),
        onSuccess: () => {
            queryClient.invalidateQueries();
            window.location.reload();
        },
    });

    useEffect(() => {
        void initializePaddle({
            environment: 'sandbox',
            token: PADDLE_TOKEN,
            eventCallback: event => {
                if (event.name === 'checkout.closed') setLoading(false);
                if (event.name === 'checkout.completed') window.location.reload();
            },
        }).then(p => {
            if (p) setPaddle(p);
        });
    }, []);

    const openCheckout = async () => {
        if (!paddle || !workspaceId) return;
        setLoading(true);
        if (workspaceId !== profile?.workspaceId) {
            await user.switchWorkspace(workspaceId);
        }
        const items: { priceId: string; quantity: number }[] = [
            { priceId: PRICES[period].base, quantity: 1 },
        ];
        if (extra > 0) items.push({ priceId: PRICES[period].seat, quantity: extra });
        paddle.Checkout.open({
            items,
            customData: {
                workspaceId: String(workspaceId),
                users: String(users),
                billing: period,
            },
            settings: { displayMode: 'overlay', theme: 'light', allowLogout: false },
        });
        setLoading(false);
    };

    const label = selected?.name ?? 'Workspace';

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-14">
            <div className="flex w-full max-w-[400px] flex-col gap-5">
                {workspaces.length > 1 ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                disabled={switchMutation.isPending}
                                className="mx-auto flex w-full max-w-[280px] items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/80 px-3 py-2.5 text-left text-sm font-medium text-neutral-900 outline-none transition-colors hover:bg-neutral-100 disabled:opacity-60"
                            >
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#492FA6]/10 text-[11px] font-bold text-[#492FA6]">
                                        {label.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate">{label}</span>
                                </div>
                                <IconChevronDown
                                    size={16}
                                    stroke={1.75}
                                    className="shrink-0 text-neutral-400"
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="center"
                            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[280px]"
                            sideOffset={6}
                        >
                            {workspaces.map(ws => (
                                <DropdownMenuItem
                                    key={ws.id}
                                    className={cn(
                                        'cursor-pointer gap-2.5 py-2.5',
                                        ws.id === workspaceId &&
                                            'bg-[#492FA6]/10 text-[#492FA6]',
                                    )}
                                    onClick={() => {
                                        if (ws.id === workspaceId) return;
                                        setWorkspaceId(ws.id);
                                        switchMutation.mutate(ws.id);
                                    }}
                                >
                                    <div className="flex size-6 shrink-0 items-center justify-center rounded bg-[#492FA6]/10 text-[10px] font-bold text-[#492FA6]">
                                        {ws.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="min-w-0 flex-1 truncate font-medium">
                                        {ws.name}
                                    </span>
                                    {ws.subscriptionStatus === 'active' ? (
                                        <span className="shrink-0 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                            Subscribed
                                        </span>
                                    ) : null}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}

                <div className="space-y-1.5 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Subscribe</h1>
                    <p className="text-sm text-muted-foreground">One subscription per workspace</p>
                </div>

                <div className="flex justify-center">
                    <div className="relative inline-flex rounded-full border border-border bg-muted/60 p-1">
                        {([false, true] as const).map(isYearly => (
                            <button
                                key={String(isYearly)}
                                type="button"
                                onClick={() => setYearly(isYearly)}
                                className={cn(
                                    'relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                                    yearly === isYearly
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {yearly === isYearly && (
                                    <motion.span
                                        layoutId="subscribe-billing-pill"
                                        className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 420,
                                            damping: 32,
                                        }}
                                    />
                                )}
                                <span className="relative">
                                    {isYearly ? 'Yearly' : 'Monthly'}
                                </span>
                                {isYearly && (
                                    <span className="relative rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                        −20%
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-[20px] border border-border bg-card p-6">
                    <div className="text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={period}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-baseline justify-center gap-1"
                            >
                                <span className="text-4xl font-semibold tracking-tight tabular-nums">
                                    ${total.toFixed(2)}
                                </span>
                                <span className="text-muted-foreground">
                                    /{yearly ? 'year' : 'month'}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Users</span>
                            <span className="text-sm font-semibold tabular-nums">{users}</span>
                        </div>
                        <Slider
                            min={5}
                            max={50}
                            step={1}
                            value={[users]}
                            onValueChange={v => setUsers(v[0] ?? 5)}
                        />
                    </div>

                    <Button
                        size="lg"
                        className="mt-6 h-12 w-full rounded-xl bg-[#264653] text-white hover:bg-[#264653]/90"
                        disabled={loading || !paddle}
                        onClick={() => void openCheckout()}
                    >
                        {loading || !paddle ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Loading…
                            </>
                        ) : (
                            'Proceed to checkout'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
