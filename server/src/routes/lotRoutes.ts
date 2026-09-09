import { Router } from 'express';
import { createLot, getLots, getLotDetails, submitOffer, acceptOffer, cancelLot } from '../controllers/LotController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, requireRole(['FARMER', 'ADMIN']), createLot);
router.get('/', getLots);
router.get('/:id', getLotDetails);
router.post('/:id/offers', authenticateToken, submitOffer);
router.post('/offers/:offerId/accept', authenticateToken, acceptOffer);
router.patch('/:id/cancel', authenticateToken, requireRole(['FARMER', 'ADMIN']), cancelLot);

export default router;
