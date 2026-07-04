import { pgTable, bigserial, bigint, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';

export const pilots = pgTable('pilots', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    workspaceId: bigint({ mode: 'number' })
        .notNull()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }),
    description: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    createdBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    updatedBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
});
