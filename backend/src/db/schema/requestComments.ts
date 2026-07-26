import { pgTable, bigserial, bigint, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { requests } from './requests';

export const requestComments = pgTable(
    'request_comments',
    {
        id: bigserial({ mode: 'number' }).primaryKey(),
        requestId: bigint({ mode: 'number' })
            .notNull()
            .references(() => requests.id, { onDelete: 'cascade' }),
        authorId: bigint({ mode: 'number' })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        body: text().notNull(),
        createdAt: timestamp({ withTimezone: true }).defaultNow(),
    },
    table => [index('idx_request_comments_request').on(table.requestId)]
);
