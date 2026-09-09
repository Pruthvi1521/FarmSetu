import { Router } from 'express';
import {
  getFarmerAnalytics,
  getBuyerAnalytics,
  getMarketSummary,
  getCommodityPriceTrend
} from '../controllers/AnalyticsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/farmer-summary', authenticateToken, getFarmerAnalytics);
router.get('/buyer-summary', authenticateToken, getBuyerAnalytics);
router.get('/market-summary', getMarketSummary);
router.get('/price-trend', getCommodityPriceTrend);

export default router;
