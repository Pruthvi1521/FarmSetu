import { Router } from 'express';
import {
  parseInput,
  getCommodities,
  getCurrentPrices,
  getPriceHistory,
  getMarketRecommendation
} from '../controllers/MarketIntelligenceController';

const router = Router();

router.post('/parse-input', parseInput);
router.get('/commodities', getCommodities);
router.get('/prices/current', getCurrentPrices);
router.get('/prices/history', getPriceHistory);
router.post('/recommend', getMarketRecommendation);

export default router;
