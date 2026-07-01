import { pgTable, bigserial, bigint, varchar, timestamp, boolean, AnyPgColumn } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    username: varchar({ length: 50 }),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    refreshToken: varchar(),
    isVerified: boolean().default(false),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    createdBy: bigint({ mode: 'number' }).references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedBy: bigint({ mode: 'number' }).references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
});
