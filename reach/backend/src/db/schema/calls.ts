import { pgTable, bigserial, bigint, varchar, timestamp, AnyPgColumn } from 'drizzle-orm/pg-core';
import { users } from './users';
import { workspaces } from './workspaces';

export const calls = pgTable('calls', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    userId: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    fromNumber: varchar({ length: 50 }).notNull(),
    toNumber: varchar({ length: 50 }).notNull(),
    status: varchar({ length: 20 }),
    statusReason: varchar({ length: 100 }),
    direction: varchar({ length: 20 }),
    callId: varchar({ length: 100 }),
    startTime: timestamp({ withTimezone: true }),
    endTime: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    workspaceId: bigint({ mode: 'number' }).notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
});
