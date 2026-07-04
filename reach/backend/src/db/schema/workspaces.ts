import { pgTable, bigserial, bigint, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { workspacePlanEnum } from './enums';

export const workspaces = pgTable('workspaces', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }),
    plan: workspacePlanEnum().default('FREE'),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    createdBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
});
