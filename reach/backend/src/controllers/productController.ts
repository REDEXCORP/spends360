import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as productService from '../services/productService';

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await productService.listProducts(req.user.workspaceId);
    return res.json(products);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(
        req.user.workspaceId,
        req.user.userId,
        req.body
    );

    return res.status(201).json(product);
});
