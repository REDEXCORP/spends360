import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN', 'USER']);

export const subscriptionStatusEnum = pgEnum('subscription_status', ['active','inactive','trialing', 'canceled', 'past_due', 'paused']);

export const subscriptionIntervalEnum = pgEnum('subscription_interval', ['month', 'year']);

export const requestStatusEnum = pgEnum('request_status', [
    'PENDING',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'COMPLETED',
]);

export const requestPriorityEnum = pgEnum('request_priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const approvalStatusEnum = pgEnum('approval_status', ['PENDING', 'APPROVED', 'REJECTED']);