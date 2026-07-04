import * as productRepository from '../repositories/productRepository';
import { AppError } from '../utils/AppError';
import { CreateProductPayload, ProductView } from '../utils/productTypes';
import { withWorkspaceAudit } from '../utils/workspaceEntity';
import { products } from '../db/schema/products';

type ProductRow = typeof products.$inferSelect;

function toProductView(row: ProductRow): ProductView {
    return {
        id: row.id,
        workspaceId: row.workspaceId,
        name: row.name,
        description: row.description,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

export const listProducts = async (workspaceId: number | null): Promise<ProductView[]> => {
    if (!workspaceId) return [];

    const rows = await productRepository.listByWorkspaceId(workspaceId);
    return rows.map(toProductView);
};

export const createProduct = async (
    workspaceId: number | null,
    userId: number,
    payload: CreateProductPayload
): Promise<ProductView> => {
    if (!workspaceId) {
        throw new AppError('Workspace is required', 400);
    }

    const name = payload.name?.trim();
    if (!name) {
        throw new AppError('Product name is required', 400);
    }

    const row = await productRepository.create(
        withWorkspaceAudit(
            {
                name,
                description: payload.description?.trim() || null,
            },
            workspaceId,
            userId
        )
    );

    return toProductView(row);
};
