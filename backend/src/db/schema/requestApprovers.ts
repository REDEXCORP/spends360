import { pgTable, bigserial, bigint, integer, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { requests } from './requests';
import { approvalStatusEnum } from './enums';

export const requestApprovers = pgTable(
    'request_approvers',
    {
        id: bigserial({ mode: 'number' }).primaryKey(),
        requestId: bigint({ mode: 'number' })
            .notNull()
            .references(() => requests.id, { onDelete: 'cascade' }),
        approverId: bigint({ mode: 'number' })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        position: integer().notNull(),
        status: approvalStatusEnum().notNull().default('PENDING'),
        comment: text(),
        actedAt: timestamp({ withTimezone: true }),
        createdAt: timestamp({ withTimezone: true }).defaultNow(),
    },
    table => [
        index('idx_request_approvers_request').on(table.requestId),
        index('idx_request_approvers_approver').on(table.approverId),
    ]
);
