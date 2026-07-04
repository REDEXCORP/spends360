import { Router } from 'express';
import { createProduct, listProducts } from '../controllers/productController';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.get('/', authenticateToken, listProducts);
router.post('/', authenticateToken, createProduct);

export default router;
