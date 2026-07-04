import { pgTable, bigserial, bigint, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';

export const leads = pgTable('leads', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    workspaceId: bigint({ mode: 'number' })
        .notNull()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 30 }).notNull(),
    email: varchar({ length: 255 }),
    source: varchar({ length: 100 }),
    about: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    createdBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    updatedBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
});
