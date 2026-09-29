import { Router } from 'express';
import { 
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, adjustStock,
  getProductStock, setProductStockTarget, getMovements,
  getCategories, createCategory, updateCategory, deleteCategory 
} from '../controllers/products.controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// `/categories` must be declared before `/:productId`, otherwise Express
// matches "categories" as a product id and every category request 400s.
router.get('/categories', requirePermission('products:view'), getCategories);
router.post('/categories', requirePermission('products:manage'), createCategory);
router.put('/categories/:categoryId', requirePermission('products:manage'), updateCategory);
router.delete('/categories/:categoryId', requirePermission('products:manage'), deleteCategory);

router.get('/', requirePermission('products:view'), getProducts);
router.post('/', requirePermission('products:manage'), createProduct);
// `/movements` is the Movement Log feed and must be matched before the
// `/:productId/...` patterns below, or "movements" would be cast to an id.
router.get('/movements', requirePermission('stock:view'), getMovements);
// Same ordering trap as `/categories` above: literal segments have to be
// matched before the `/:productId/...` patterns.
router.get('/:productId/stock', requirePermission('stock:view'), getProductStock);
// `stock:manage` covers both adjusting quantities and setting a location's
// minimum target — they are the same responsibility at the same shelf.
router.post('/:productId/stock', requirePermission('stock:manage'), adjustStock);
router.put('/:productId/stock/:branchId', requirePermission('stock:manage'), setProductStockTarget);
router.get('/:productId', requirePermission('products:view'), getProduct);
router.put('/:productId', requirePermission('products:manage'), updateProduct);
router.delete('/:productId', requirePermission('products:manage'), deleteProduct);

export default router;