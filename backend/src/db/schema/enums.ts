import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN', 'USER']);

export const subscriptionStatusEnum = pgEnum('subscription_status', ['active','inactive','trialing', 'canceled', 'past_due', 'paused']);

export const subscriptionIntervalEnum = pgEnum('subscription_interval', ['month', 'year']);