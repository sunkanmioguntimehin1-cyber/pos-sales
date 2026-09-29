import { Router } from 'express';
import { getOrders, createOrder, getOrder, updateOrderStatus } from '../controllers/orders.controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('orders:view'), getOrders);
// Ringing an order up is the POS action itself.
router.post('/', requirePermission('pos'), createOrder);
router.get('/:orderId', requirePermission('orders:view'), getOrder);
router.put('/:orderId/status', requirePermission('orders:manage'), updateOrderStatus);

export default router;