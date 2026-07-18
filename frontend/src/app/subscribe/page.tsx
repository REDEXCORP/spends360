'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { toastError, toastSuccess } from '@/helpers';
import { user } from '@/requests';
import Loading from '@/components/Loading';

const INCLUDED_USERS = 5;
const MONTHLY_BASE = 9.99;
const MONTHLY_PER_USER = 1;
const YEARLY_BASE = 95.99;
const YEARLY_PER_USER = 10;

const PADDLE_ENV = 'sandbox' as const;
const PADDLE_CLIENT_TOKEN = 'test_53059d4dc2c56f50985d465efd5';
const PADDLE_PRICE_MONTHLY_BASE = 'pri_01kxt4ejrmq9tm7jw5jda2h4pn';
const PADDLE_PRICE_YEARLY_BASE = 'pri_01kxt4nr8y9jehazc92yv82tqk';
const PADDLE_PRICE_MONTHLY_SEAT = 'pri_01kxt4m9c0e7d3rtxgnjhn7gde';
const PADDLE_PRICE_YEARLY_SEAT = 'pri_01kxt4pdvfn2m46qdt7qqbt1mk';

function formatMoney(amount: number) {
    return amount.toFixed(2);
}

function calcTotal(users: number, yearly: boolean) {
    const additional = Math.max(0, users - INCLUDED_USERS);
    return yearly
        ? YEARLY_BASE + additional * YEARLY_PER_USER
        : MONTHLY_BASE + additional * MONTHLY_PER_USER;
}

function getCheckoutItems(users: number, yearly: boolean) {
    const basePriceId = yearly ? PADDLE_PRICE_YEARLY_BASE : PADDLE_PRICE_MONTHLY_BASE;
    const seatPriceId = yearly ? PADDLE_PRICE_YEARLY_SEAT : PADDLE_PRICE_MONTHLY_SEAT;

    const items: { priceId: string; quantity: number }[] = [
        { priceId: basePriceId, quantity: 1 },
    ];

    const extraSeats = Math.max(0, users - INCLUDED_USERS);
    if (extraSeats > 0) {
        items.push({ priceId: seatPriceId, quantity: extraSeats });
    }

    return items;
}

export default function SubscribePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [yearly, setYearly] = useState(true);
    const [users, setUsers] = useState(5);
    const [paddle, setPaddle] = useState<Paddle | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const activatingRef = useRef(false);

    const {
        data: profile,
        isLoading: profileLoading,
        error: profileError,
    } = useQuery({
        queryKey: ['user-profile'],
        queryFn: () => user.profile(),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const total = calcTotal(users, yearly);
    const workspaceId =
        profile?.workspaceId ??
        profile?.workspaces?.find((w: { isDefault?: boolean }) => w.isDefault)?.id ??
        profile?.workspaces?.[0]?.id ??
        null;
    const subscriptionStatus =
        profile?.subscriptionStatus ??
        profile?.workspaces?.find((w: { id?: number }) => w.id === workspaceId)?.subscriptionStatus ??
        'inactive';

    useEffect(() => {
        if (profileError) router.replace('/login');
    }, [profileError, router]);

    useEffect(() => {
        if (subscriptionStatus === 'active') {
            router.replace('/');
        }
    }, [subscriptionStatus, router]);

    useEffect(() => {
        void initializePaddle({
            environment: PADDLE_ENV,
            token: PADDLE_CLIENT_TOKEN,
            eventCallback: (event) => {
                if (event.name !== 'checkout.completed') return;
                if (activatingRef.current) return;
                activatingRef.current = true;

                toastSuccess('Payment received. Activating your workspace…');

                void (async () => {
                    for (let i = 0; i < 15; i++) {
                        await new Promise(r => setTimeout(r, 1500));
                        const fresh = await queryClient.fetchQuery({
                            queryKey: ['user-profile'],
                            queryFn: () => user.profile(),
                        });
                        if (fresh?.subscriptionStatus === 'active') {
                            toastSuccess('Subscription successful');
                            router.push('/');
                            return;
                        }
                    }
                    activatingRef.current = false;
                    toastError('Payment received, but activation is still pending. Refresh in a moment.');
                })();
            },
        }).then((instance) => {
            if (instance) setPaddle(instance);
        });
    }, [queryClient, router]);

    const openCheckout = useCallback(() => {
        setError(null);

        if (!paddle) {
            setError('Checkout is still loading. Try again in a moment.');
            return;
        }

        if (!workspaceId) {
            setError('No workspace found. Please refresh and try again.');
            return;
        }

        if (subscriptionStatus === 'active') {
            router.replace('/');
            return;
        }

        try {
            setLoading(true);
            const items = getCheckoutItems(users, yearly);

            paddle.Checkout.open({
                items,
                customData: {
                    workspaceId: String(workspaceId),
                    users: String(users),
                    billing: yearly ? 'yearly' : 'monthly',
                },
                settings: {
                    displayMode: 'overlay',
                    theme: 'light',
                    allowLogout: false,
                },
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not open checkout.');
        } finally {
            setLoading(false);
        }
    }, [paddle, users, yearly, workspaceId, subscriptionStatus, router]);

    if (profileLoading || !profile || subscriptionStatus === 'active') {
        return <Loading />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-14">
            <div className="w-full max-w-[400px]">
                <h1 className="text-center text-2xl font-semibold tracking-tight">Subscribe</h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    One subscription per workspace
                </p>

                <div className="mt-6 flex justify-center">
                    <div
                        role="tablist"
                        aria-label="Billing period"
                        className="relative inline-flex rounded-full border border-border bg-muted/60 p-1"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={!yearly}
                            onClick={() => setYearly(false)}
                            className={cn(
                                'relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                                !yearly
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {!yearly && (
                                <motion.span
                                    layoutId="billing-pill"
                                    className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border"
                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                />
                            )}
                            <span className="relative">Monthly</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={yearly}
                            onClick={() => setYearly(true)}
                            className={cn(
                                'relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                                yearly
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {yearly && (
                                <motion.span
                                    layoutId="billing-pill"
                                    className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border"
                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                />
                            )}
                            <span className="relative">Yearly</span>
                            <span className="relative rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                −20%
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-6 rounded-[20px] border border-border bg-card p-7">
                    <div className="text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={yearly ? 'yearly' : 'monthly'}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-baseline justify-center gap-1"
                            >
                                <span className="text-5xl font-semibold tracking-tight tabular-nums">
                                    ${formatMoney(total)}
                                </span>
                                <span className="text-muted-foreground">
                                    /{yearly ? 'year' : 'month'}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="mt-8">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Users</span>
                            <span className="text-sm font-semibold tabular-nums">{users}</span>
                        </div>
                        <Slider
                            min={5}
                            max={50}
                            step={1}
                            value={[users]}
                            onValueChange={(v) => setUsers(v[0] ?? 5)}
                        />
                        {users > 40 && (
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Need more than 50? Add users anytime from the dashboard after you
                                subscribe.
                            </p>
                        )}
                    </div>

                    {error && (
                        <p className="mt-4 text-center text-xs text-destructive">{error}</p>
                    )}

                    <Button
                        size="lg"
                        className="mt-8 h-12 w-full rounded-xl bg-[#264653] text-white hover:bg-[#264653]/90"
                        disabled={loading || !paddle}
                        onClick={openCheckout}
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
