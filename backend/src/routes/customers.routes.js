import { Router } from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customers.controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('customers:view'), getCustomers);
router.post('/', requirePermission('customers:manage'), createCustomer);
router.get('/:customerId', requirePermission('customers:view'), getCustomer);
router.put('/:customerId', requirePermission('customers:manage'), updateCustomer);
router.delete('/:customerId', requirePermission('customers:manage'), deleteCustomer);

export default router;