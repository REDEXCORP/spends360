import { pgTable, bigserial, bigint, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { subscriptionIntervalEnum, subscriptionStatusEnum } from './enums';

export const workspaces = pgTable('workspaces', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    subscriptionStatus: subscriptionStatusEnum('subscription_status').default('inactive').notNull(),
    subscriptionInterval: subscriptionIntervalEnum('subscription_interval').default('month').notNull(),
    userCount: integer().default(5).notNull(),
    paddleSubscriptionId: varchar({ length: 255 }),
    createdBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
});
