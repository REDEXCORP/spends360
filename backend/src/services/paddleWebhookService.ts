import { EventName } from '@paddle/paddle-node-sdk';
import * as workspaceRepository from '../repositories/workspaceRepository';

type CustomData = {
    workspaceId?: string;
    users?: string;
    billing?: string;
};

const mapStatus = (
    status?: string | null
): 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due' | 'paused' => {
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

const parseCustomData = (customData: unknown): CustomData => {
    if (!customData || typeof customData !== 'object') return {};
    return customData as CustomData;
};

export const applySubscriptionFromWebhook = async (eventType: string, data: any) => {
    const customData = parseCustomData(data?.customData);
    const workspaceId = Number(customData.workspaceId);

    if (!Number.isFinite(workspaceId) || workspaceId <= 0) {
        console.warn('[paddle webhook] missing workspaceId in customData', eventType);
        return;
    }

    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
        console.warn('[paddle webhook] workspace not found', workspaceId);
        return;
    }

    const users = Math.min(50, Math.max(5, Number(customData.users) || workspace.userCount || 5));
    const billing = customData.billing === 'yearly' ? 'year' : 'month';
    const subscriptionId = typeof data?.id === 'string' && data.id.startsWith('sub_') ? data.id : data?.subscriptionId;

    if (
        eventType === EventName.SubscriptionActivated ||
        eventType === EventName.SubscriptionCreated ||
        eventType === EventName.SubscriptionTrialing ||
        eventType === EventName.TransactionCompleted
    ) {
        // One subscription per workspace — keep active if already active
        if (workspace.subscriptionStatus === 'active' && eventType === EventName.TransactionCompleted) {
            return;
        }

        await workspaceRepository.activateSubscription(workspaceId, {
            subscriptionInterval: billing,
            userCount: users,
            paddleSubscriptionId: subscriptionId ?? workspace.paddleSubscriptionId,
            updatedBy: workspace.createdBy ?? workspace.updatedBy ?? null,
        });
        return;
    }

    if (eventType === EventName.SubscriptionUpdated || eventType === EventName.SubscriptionPastDue) {
        const status = mapStatus(data?.status);
        if (status === 'active' || status === 'trialing') {
            await workspaceRepository.activateSubscription(workspaceId, {
                subscriptionInterval: billing,
                userCount: users,
                paddleSubscriptionId: subscriptionId ?? workspace.paddleSubscriptionId,
                updatedBy: workspace.createdBy ?? workspace.updatedBy ?? null,
            });
        } else {
            await workspaceRepository.updateSubscriptionStatus(workspaceId, status, subscriptionId);
        }
        return;
    }

    if (
        eventType === EventName.SubscriptionCanceled ||
        eventType === EventName.SubscriptionPaused
    ) {
        await workspaceRepository.updateSubscriptionStatus(
            workspaceId,
            mapStatus(data?.status) || (eventType === EventName.SubscriptionCanceled ? 'canceled' : 'paused'),
            subscriptionId
        );
    }
};
