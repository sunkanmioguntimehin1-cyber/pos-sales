import { Router } from 'express';
import { 
  getProducts, createProduct, updateProduct, deleteProduct, adjustStock,
  getCategories, createCategory, updateCategory, deleteCategory 
} from '../controllers/products.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);
router.post('/:productId/stock', adjustStock);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

export default router;
