import { EventName } from '@paddle/paddle-node-sdk';
import { userCountFromSubscriptionItems } from '../config/paddlePrices';
import * as workspaceRepository from '../repositories/workspaceRepository';

type CustomData = {
    workspaceId?: string;
    users?: string;
    billing?: string;
};

type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due' | 'paused';

const parseCustomData = (customData: unknown): CustomData => {
    if (!customData || typeof customData !== 'object') return {};
    return customData as CustomData;
};

const mapStatus = (status?: string | null): SubscriptionStatus => {
    switch (status) {
        case 'active':
            return 'active';
        case 'trialing':
            return 'trialing';
        case 'canceled':
            return 'canceled';
        case 'past_due':
            return 'past_due';
        case 'paused':
            return 'paused';
        default:
            return 'inactive';
    }
};

const getPaddleSubscriptionId = (data: any): string | null => {
    if (typeof data?.id === 'string' && data.id.startsWith('sub_')) return data.id;
    if (typeof data?.subscriptionId === 'string' && data.subscriptionId.startsWith('sub_')) {
        return data.subscriptionId;
    }
    return null;
};

const getInterval = (
    customData: CustomData,
    data: any,
    fallback: 'month' | 'year'
): 'month' | 'year' => {
    if (customData.billing === 'yearly' || customData.billing === 'year') return 'year';
    if (customData.billing === 'monthly' || customData.billing === 'month') return 'month';

    const fromCycle = data?.billingCycle?.interval ?? data?.items?.[0]?.price?.billingCycle?.interval;
    if (fromCycle === 'year') return 'year';
    if (fromCycle === 'month') return 'month';

    return fallback;
};

const getUserCount = (customData: CustomData, data: any, fallback: number): number => {
    const fromItems = userCountFromSubscriptionItems(data?.items, NaN);
    if (Number.isFinite(fromItems)) return fromItems;

    const parsed = Number(customData.users);
    if (Number.isFinite(parsed)) return Math.min(50, Math.max(5, parsed));

    return fallback;
};

const resolveWorkspace = async (customData: CustomData, paddleSubscriptionId: string | null) => {
    const workspaceId = Number(customData.workspaceId);
    if (Number.isFinite(workspaceId) && workspaceId > 0) {
        return workspaceRepository.getById(workspaceId);
    }
    if (paddleSubscriptionId) {
        return workspaceRepository.getByPaddleSubscriptionId(paddleSubscriptionId);
    }
    return null;
};

export const applySubscriptionFromWebhook = async (eventType: string, data: any) => {
    const customData = parseCustomData(data?.customData);
    const paddleSubscriptionId = getPaddleSubscriptionId(data);
    const workspace = await resolveWorkspace(customData, paddleSubscriptionId);

    if (!workspace) {
        console.warn('[paddle webhook] workspace not found', { eventType, customData, paddleSubscriptionId });
        return;
    }

    const subscriptionInterval = getInterval(customData, data, workspace.subscriptionInterval);
    const userCount = getUserCount(customData, data, workspace.userCount);

    // Activate / create / first payment
    if (
        eventType === EventName.SubscriptionActivated ||
        eventType === EventName.SubscriptionCreated ||
        eventType === EventName.SubscriptionTrialing ||
        eventType === EventName.TransactionCompleted
    ) {
        const status: SubscriptionStatus =
            eventType === EventName.SubscriptionTrialing ? 'trialing' : 'active';

        await workspaceRepository.updateSubscription(workspace.id, {
            subscriptionStatus: status,
            subscriptionInterval,
            userCount,
            paddleSubscriptionId: paddleSubscriptionId ?? workspace.paddleSubscriptionId,
        });
        return;
    }

    // Status / quantity changes
    if (
        eventType === EventName.SubscriptionUpdated ||
        eventType === EventName.SubscriptionPastDue ||
        eventType === EventName.SubscriptionCanceled ||
        eventType === EventName.SubscriptionPaused
    ) {
        let status = mapStatus(data?.status);
        if (eventType === EventName.SubscriptionCanceled) status = 'canceled';
        if (eventType === EventName.SubscriptionPaused) status = 'paused';
        if (eventType === EventName.SubscriptionPastDue) status = 'past_due';

        await workspaceRepository.updateSubscription(workspace.id, {
            subscriptionStatus: status,
            subscriptionInterval,
            userCount,
            paddleSubscriptionId: paddleSubscriptionId ?? workspace.paddleSubscriptionId,
        });
    }
};
