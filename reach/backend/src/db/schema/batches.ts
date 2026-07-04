import { pgTable, bigserial, bigint, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';

export const batches = pgTable('batches', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    workspaceId: bigint({ mode: 'number' })
        .notNull()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    tags: jsonb().$type<string[]>().notNull().default([]),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    createdBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    updatedBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
});
