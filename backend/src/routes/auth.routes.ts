import { Router } from 'express';
import { login, registerSuperadmin, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', registerSuperadmin);
router.get('/me', authMiddleware, getMe);

export default router;
