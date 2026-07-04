import { pgTable, bigserial, bigint, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';
import { PhoneNumberRecord } from '../../utils/phoneNumberTypes';

export const telnyxConfigs = pgTable('telnyx_configs', {
    id: bigserial({ mode: 'number' }).primaryKey(),
    workspaceId: bigint({ mode: 'number' })
        .notNull()
        .unique()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    apiKeyEncrypted: text().notNull(),
    connectionId: text().notNull(),
    username: text().notNull(),
    passwordEncrypted: text().notNull(),
    publicKeyEncrypted: text().notNull(),
    smsNumbers: jsonb().$type<PhoneNumberRecord[]>().notNull().default([]),
    callerIds: jsonb().$type<PhoneNumberRecord[]>().default([]),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedBy: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
});
