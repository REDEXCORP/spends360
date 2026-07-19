import { paddle } from '../config/paddle';
import {
    INCLUDED_USERS,
    MAX_USERS,
    MIN_USERS,
    checkoutItemsForUsers,
    clampUsers,
    userCountFromSubscriptionItems,
} from '../config/paddlePrices';
import * as workspaceRepository from '../repositories/workspaceRepository';
import * as usersRepository from '../repositories/usersRepository';
import { AppError } from '../utils/AppError';

const requireActiveSubscription = async (workspaceId: number) => {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) throw new AppError('Workspace not found', 404);

    const paddleSubscriptionId = await ensurePaddleSubscriptionId(workspace);
    if (!paddleSubscriptionId) {
        throw new AppError('No Paddle subscription found for this workspace.', 400);
    }
    if (workspace.subscriptionStatus !== 'active' && workspace.subscriptionStatus !== 'trialing') {
        throw new AppError('Workspace does not have an active subscription.', 400);
    }

    return { ...workspace, paddleSubscriptionId };
};

/** Heal missing paddleSubscriptionId by matching Paddle customData.workspaceId */
const ensurePaddleSubscriptionId = async (workspace: {
    id: number;
    paddleSubscriptionId: string | null;
    subscriptionStatus: string;
    subscriptionInterval: 'month' | 'year';
    userCount: number;
}) => {
    if (workspace.paddleSubscriptionId) return workspace.paddleSubscriptionId;

    try {
        const collection = paddle.subscriptions.list({
            status: ['active', 'trialing', 'past_due', 'paused'],
            perPage: 50,
        });
        const subs = await collection.next();
        const match = subs.find(sub => {
            const data = sub.customData as { workspaceId?: string } | null;
            return String(data?.workspaceId ?? '') === String(workspace.id);
        });

        if (!match) return null;

        const interval = match.billingCycle?.interval === 'year' ? 'year' : 'month';
        const userCount = userCountFromSubscriptionItems(match.items, workspace.userCount);

        await workspaceRepository.updateSubscription(workspace.id, {
            subscriptionStatus:
                match.status === 'trialing'
                    ? 'trialing'
                    : match.status === 'active'
                      ? 'active'
                      : (workspace.subscriptionStatus as any),
            subscriptionInterval: interval,
            userCount,
            paddleSubscriptionId: match.id,
        });

        return match.id;
    } catch (error) {
        console.error('[billing] failed to resolve paddle subscription', error);
        return null;
    }
};

export const getBilling = async (workspaceId: number) => {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) throw new AppError('Workspace not found', 404);

    const members = await usersRepository.listUsersByWorkspaceId(workspaceId);
    const memberCount = members.length;

    let paddleSubscriptionId = await ensurePaddleSubscriptionId(workspace);
    let nextBilledAt: string | null = null;
    let managementUrls: { updatePaymentMethod: string | null; cancel: string | null } = {
        updatePaymentMethod: null,
        cancel: null,
    };
    let portalUrl: string | null = null;
    let paddleError: string | null = null;
    let invoices: Array<{
        id: string;
        invoiceNumber: string | null;
        status: string;
        billedAt: string | null;
        currencyCode: string;
        total: string | null;
        invoicePdfUrl: string | null;
    }> = [];

    if (paddleSubscriptionId) {
        try {
            const subscription = await paddle.subscriptions.get(paddleSubscriptionId);
            nextBilledAt = subscription.nextBilledAt;
            managementUrls = {
                updatePaymentMethod: subscription.managementUrls?.updatePaymentMethod ?? null,
                cancel: subscription.managementUrls?.cancel ?? null,
            };

            try {
                const session = await paddle.customerPortalSessions.create(subscription.customerId, [
                    subscription.id,
                ]);
                portalUrl = session.urls.general.overview;
            } catch (portalError) {
                console.error('[billing] portal session failed', portalError);
            }

            const collection = paddle.transactions.list({
                subscriptionId: [paddleSubscriptionId],
                perPage: 30,
            });
            const transactions = await collection.next();
            const relevant = transactions.filter(tx =>
                ['billed', 'completed', 'paid', 'past_due'].includes(tx.status)
            );

            invoices = await Promise.all(
                relevant.map(async tx => {
                    let invoicePdfUrl: string | null = null;
                    try {
                        const pdf = await paddle.transactions.getInvoicePDF(tx.id);
                        invoicePdfUrl = pdf.url;
                    } catch {
                        invoicePdfUrl = null;
                    }

                    return {
                        id: tx.id,
                        invoiceNumber: tx.invoiceNumber,
                        status: tx.status,
                        billedAt: tx.billedAt ?? tx.createdAt,
                        currencyCode: tx.currencyCode,
                        total: tx.details?.totals?.grandTotal ?? tx.details?.totals?.total ?? null,
                        invoicePdfUrl,
                    };
                })
            );
        } catch (error: any) {
            console.error('[billing] failed to load paddle data', error);
            paddleError = error?.message || 'Failed to load Paddle billing data';
        }
    } else if (workspace.subscriptionStatus === 'active' || workspace.subscriptionStatus === 'trialing') {
        paddleError =
            'Subscription is active but not linked to Paddle yet. Complete checkout again or wait for the webhook.';
    }

    const fresh = await workspaceRepository.getById(workspaceId);

    return {
        subscriptionStatus: fresh?.subscriptionStatus ?? workspace.subscriptionStatus,
        subscriptionInterval: fresh?.subscriptionInterval ?? workspace.subscriptionInterval,
        userCount: fresh?.userCount ?? workspace.userCount,
        includedUsers: INCLUDED_USERS,
        minUsers: MIN_USERS,
        maxUsers: MAX_USERS,
        memberCount,
        nextBilledAt,
        paddleSubscriptionId: fresh?.paddleSubscriptionId ?? paddleSubscriptionId,
        managementUrls,
        portalUrl,
        paddleError,
        invoices,
    };
};

export const updateSeats = async (workspaceId: number, users: number) => {
    const workspace = await requireActiveSubscription(workspaceId);
    const nextUsers = clampUsers(users);

    const members = await usersRepository.listUsersByWorkspaceId(workspaceId);
    if (nextUsers < members.length) {
        throw new AppError(
            `Cannot set seats below current members (${members.length}). Remove members first.`,
            400
        );
    }

    const subscription = await paddle.subscriptions.get(workspace.paddleSubscriptionId!);
    const interval =
        subscription.billingCycle?.interval === 'year'
            ? 'year'
            : workspace.subscriptionInterval === 'year'
              ? 'year'
              : 'month';

    const items = checkoutItemsForUsers(nextUsers, interval);
    const customData = {
        ...(typeof subscription.customData === 'object' && subscription.customData
            ? subscription.customData
            : {}),
        workspaceId: String(workspaceId),
        users: String(nextUsers),
        billing: interval === 'year' ? 'yearly' : 'monthly',
    };

    const updated = await paddle.subscriptions.update(workspace.paddleSubscriptionId!, {
        items,
        customData,
        prorationBillingMode: 'prorated_immediately',
    });

    const syncedUsers = userCountFromSubscriptionItems(updated.items, nextUsers);

    await workspaceRepository.updateSubscription(workspaceId, {
        subscriptionStatus:
            updated.status === 'trialing'
                ? 'trialing'
                : updated.status === 'active'
                  ? 'active'
                  : workspace.subscriptionStatus,
        subscriptionInterval: interval,
        userCount: syncedUsers,
        paddleSubscriptionId: updated.id,
    });

    return {
        userCount: syncedUsers,
        subscriptionStatus: updated.status,
        nextBilledAt: updated.nextBilledAt,
    };
};

export const createPortalSession = async (workspaceId: number) => {
    const workspace = await requireActiveSubscription(workspaceId);
    const subscription = await paddle.subscriptions.get(workspace.paddleSubscriptionId!);

    try {
        const session = await paddle.customerPortalSessions.create(subscription.customerId, [
            subscription.id,
        ]);
        return { url: session.urls.general.overview };
    } catch {
        const fallback =
            subscription.managementUrls?.updatePaymentMethod || subscription.managementUrls?.cancel;
        if (!fallback) {
            throw new AppError('Could not open Paddle billing portal.', 500);
        }
        return { url: fallback };
    }
};
