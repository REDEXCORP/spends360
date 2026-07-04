import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN', 'USER']);

export const workspacePlanEnum = pgEnum('plan', ['FREE', 'PRO', 'ENTERPRISE']);
