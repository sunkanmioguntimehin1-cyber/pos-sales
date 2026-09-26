import { Router } from 'express';
import { 
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, adjustStock,
  getCategories, createCategory, updateCategory, deleteCategory 
} from '../controllers/products.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// `/categories` must be declared before `/:productId`, otherwise Express
// matches "categories" as a product id and every category request 400s.
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:productId', getProduct);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);
router.post('/:productId/stock', adjustStock);

export default router;
