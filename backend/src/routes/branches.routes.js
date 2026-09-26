import { Router } from 'express';
import { getBranches, getBranch, createBranch, updateBranch, deleteBranch } from '../controllers/branches.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getBranches);
router.post('/', createBranch);
router.get('/:branchId', getBranch);
router.put('/:branchId', updateBranch);
router.delete('/:branchId', deleteBranch);

export default router;
