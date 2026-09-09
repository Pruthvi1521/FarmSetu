import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead
} from '../controllers/NotificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.patch('/read-all', authenticateToken, markAllRead);
router.patch('/:id/read', authenticateToken, markOneRead);

export default router;
