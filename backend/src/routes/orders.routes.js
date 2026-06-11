import { Router } from 'express';
import { getOrders, createOrder, getOrder, updateOrderStatus } from '../controllers/orders.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getOrders);
router.post('/', createOrder);
router.get('/:orderId', getOrder);
router.put('/:orderId/status', updateOrderStatus);

export default router;
