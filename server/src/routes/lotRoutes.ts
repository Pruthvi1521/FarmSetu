import { Router } from 'express';
import { createLot, getLots, getLotDetails, submitOffer, acceptOffer } from '../controllers/LotController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createLot);
router.get('/', getLots);
router.get('/:id', getLotDetails);
router.post('/:id/offers', authenticateToken, submitOffer);
router.post('/offers/:offerId/accept', authenticateToken, acceptOffer);

export default router;
