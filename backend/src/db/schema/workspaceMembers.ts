import { pgTable, bigserial, bigint, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { workspaces } from './workspaces';
import { roleEnum } from './enums';

export const workspaceMembers = pgTable(
    'workspace_members',
    {
        id: bigserial({ mode: 'number' }).primaryKey(),
        userId: bigint({ mode: 'number' })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        workspaceId: bigint({ mode: 'number' })
            .notNull()
            .references(() => workspaces.id, { onDelete: 'cascade' }),
        role: roleEnum().notNull(),
        isDefault: boolean().default(false),
        inviteAccepted: boolean().default(false),
        createdAt: timestamp({ withTimezone: true }).defaultNow(),
        createdBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
        updatedAt: timestamp({ withTimezone: true }).defaultNow(),
        updatedBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    },
    table => [
        uniqueIndex('uq_user_workspace').on(table.userId, table.workspaceId),
        uniqueIndex('uq_user_default_workspace')
            .on(table.userId)
            .where(sql`${table.isDefault} = true`),
    ]
);
