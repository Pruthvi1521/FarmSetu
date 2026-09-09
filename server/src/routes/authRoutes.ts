import { Router } from 'express';
import { register, login, demoLogin, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply auth rate limiter (30 requests/min) to login & register endpoints
router.post('/register', authRateLimiter(30, 60 * 1000), register);
router.post('/login', authRateLimiter(30, 60 * 1000), login);
router.post('/demo-login', authRateLimiter(50, 60 * 1000), demoLogin);
router.get('/me', authenticateToken, getMe);

export default router;
