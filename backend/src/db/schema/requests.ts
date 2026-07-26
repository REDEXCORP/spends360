import { pgTable, bigserial, bigint, varchar, text, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { workspaces } from './workspaces';
import { requestStatusEnum, requestPriorityEnum } from './enums';

export const requests = pgTable(
    'requests',
    {
        id: bigserial({ mode: 'number' }).primaryKey(),
        workspaceId: bigint({ mode: 'number' })
            .notNull()
            .references(() => workspaces.id, { onDelete: 'cascade' }),
        requesterId: bigint({ mode: 'number' })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        type: varchar({ length: 120 }),
        title: varchar({ length: 255 }).notNull(),
        description: text(),
        justification: text(),
        amount: numeric({ precision: 14, scale: 2 }),
        currency: varchar({ length: 3 }).notNull().default('USD'),
        department: varchar({ length: 120 }),
        project: varchar({ length: 120 }),
        costCenter: varchar({ length: 120 }),
        vendor: varchar({ length: 150 }),
        category: varchar({ length: 120 }),
        priority: requestPriorityEnum().notNull().default('MEDIUM'),
        status: requestStatusEnum().notNull().default('PENDING'),
        dueDate: timestamp({ withTimezone: true }),
        assigneeId: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
        tags: text().array().notNull().default([]),
        createdAt: timestamp({ withTimezone: true }).defaultNow(),
        updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    },
    table => [
        index('idx_requests_workspace').on(table.workspaceId),
        index('idx_requests_requester').on(table.workspaceId, table.requesterId),
    ]
);
