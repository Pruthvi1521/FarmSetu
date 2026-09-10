import { Router } from 'express';
import { TransportController } from '../controllers/TransportController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/estimate', TransportController.getEstimate);
router.get('/recommend-vehicle', TransportController.getVehicleRecommendation);
router.post('/bookings', authenticateToken, TransportController.createBooking);
router.get('/farmer-bookings', authenticateToken, TransportController.getFarmerBookings);
router.get('/bookings/transaction/:transactionId', authenticateToken, TransportController.getBookingByTransaction);
router.patch('/bookings/:id/status', authenticateToken, TransportController.updateBookingStatus);

export default router;
