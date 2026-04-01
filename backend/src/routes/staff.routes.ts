import { Router } from 'express';
import { getStaff, createStaff, updateStaff, deleteStaff, verifyPin } from '../controllers/staff.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getStaff);
router.post('/', createStaff);
router.post('/verify-pin', verifyPin);
router.put('/:staffId', updateStaff);
router.delete('/:staffId', deleteStaff);

export default router;
