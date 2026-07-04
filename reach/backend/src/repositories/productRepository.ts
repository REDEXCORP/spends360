import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { products } from '../db/schema/products';

export type ProductInsert = typeof products.$inferInsert;

export const listByWorkspaceId = async (workspaceId: number) => {
    return await db
        .select()
        .from(products)
        .where(eq(products.workspaceId, workspaceId))
        .orderBy(desc(products.createdAt));
};

export const create = async (data: ProductInsert) => {
    const result = await db.insert(products).values(data).returning();
    return result[0];
};
