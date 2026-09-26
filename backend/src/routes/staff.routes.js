import { Router } from 'express';
import { getStaff, getStaffMember, createStaff, updateStaff, deleteStaff, verifyPin } from '../controllers/staff.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getStaff);
router.post('/', createStaff);
router.post('/verify-pin', verifyPin);
router.get('/:staffId', getStaffMember);
router.put('/:staffId', updateStaff);
router.delete('/:staffId', deleteStaff);

export default router;
