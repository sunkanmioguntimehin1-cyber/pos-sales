import { Router } from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customers.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:customerId', updateCustomer);
router.delete('/:customerId', deleteCustomer);

export default router;
