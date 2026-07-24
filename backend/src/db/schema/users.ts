import { pgTable, bigserial, bigint, varchar, timestamp, boolean, AnyPgColumn } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';

export const users = pgTable('users', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    isVerified: boolean().default(false),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    createdBy: bigint({ mode: 'number' }).references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedBy: bigint({ mode: 'number' }).references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
    otp: varchar({ length: 6 }),
    otpExpiresAt: timestamp({ withTimezone: true }),
    lastLoginAt: timestamp({ withTimezone: true }),
    lastLoginIp: varchar({ length: 45 }),
    defaultWorkspaceId: bigint({ mode: 'number' }).references((): AnyPgColumn => workspaces.id, { onDelete: 'set null' }),
});
