import { Router } from 'express';
import {
  getUserTransactions,
  getTransactionDetails,
  updateTransactionStatus
} from '../controllers/TransactionController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getUserTransactions);
router.get('/:id', authenticateToken, getTransactionDetails);
router.patch('/:id/status', authenticateToken, updateTransactionStatus);

export default router;
