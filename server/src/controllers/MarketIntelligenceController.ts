import { Request, Response } from 'express';
import { Commodity } from '../models/Commodity';
import { Market } from '../models/Market';
import { MarketPrice } from '../models/MarketPrice';
import { WeatherRecord } from '../models/WeatherRecord';
import { parseFarmerInputText } from '../utils/inputParser';
import { PriceIntelligenceService } from '../services/PriceIntelligenceService';
import { TransportService } from '../services/TransportService';
import { MarketRankingService } from '../services/MarketRankingService';
import { BuyerMatchingService } from '../services/BuyerMatchingService';
import { SellingGuidanceService } from '../services/SellingGuidanceService';
import { AuthRequest } from '../middleware/authMiddleware';

export const parseInput = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text query is required.' });
    }
    const result = await parseFarmerInputText(text);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error parsing input' });
  }
};

export const getCommodities = async (req: Request, res: Response) => {
  try {
    const commodities = await Commodity.find({}).sort({ name: 1 }).lean();
    return res.json(commodities);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching commodities' });
  }
};

export const getCurrentPrices = async (req: Request, res: Response) => {
  try {
    const { commodityId, district } = req.query;
    const filter: any = {};
    if (commodityId) filter.commodityId = commodityId;

    const prices = await MarketPrice.find(filter)
      .sort({ date: -1 })
      .populate('marketId')
      .populate('commodityId')
      .limit(20)
      .lean();

    return res.json(prices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching current prices' });
  }
};

export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const { commodityId, marketId, days } = req.query;
    if (!commodityId || !marketId) {
      return res.status(400).json({ error: 'commodityId and marketId are required.' });
    }

    const daysNum = days ? parseInt(days as string, 10) : 30;
    const history = await PriceIntelligenceService.getHistoricalPrices(
      commodityId as string,
      marketId as string,
      daysNum
    );

    return res.json(history);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching price history' });
  }
};

// Core Recommendation Engine Endpoint
export const getMarketRecommendation = async (req: Request, res: Response) => {
  try {
    const { queryText, commodityId, quantityKg, availabilityDays, farmerLocation } = req.body;

    let parsedEntity;
    if (queryText) {
      parsedEntity = await parseFarmerInputText(queryText);
    } else {
      parsedEntity = {
        commodity: 'Tomato',
        commodityId,
        quantityKg: quantityKg || 2000,
        availabilityDays: availabilityDays || 5,
        originalText: '',
        confidence: 100
      };
    }

    // Validate parsed/passed numerical inputs
    const numQty = Number(parsedEntity.quantityKg);
    if (isNaN(numQty) || !isFinite(numQty) || numQty <= 0) {
      return res.status(400).json({ error: 'quantityKg must be a valid positive number greater than 0.' });
    }
    parsedEntity.quantityKg = numQty;

    const numDays = Number(parsedEntity.availabilityDays);
    if (isNaN(numDays) || !isFinite(numDays) || numDays < 0) {
      return res.status(400).json({ error: 'availabilityDays must be a valid non-negative number.' });
    }
    parsedEntity.availabilityDays = numDays;

    // Resolve commodityId if missing
    let targetCommodityId = parsedEntity.commodityId || commodityId;
    if (!targetCommodityId) {
      const commDoc = await Commodity.findOne({ name: new RegExp(parsedEntity.commodity, 'i') });
      if (commDoc) targetCommodityId = commDoc._id.toString();
    }

    if (!targetCommodityId) {
      return res.status(400).json({ error: `Commodity '${parsedEntity.commodity}' not found in database.` });
    }

    // Default farmer location (Madanapalle, AP)
    const farmerCoords = farmerLocation?.coordinates || { lat: 13.5504, lng: 78.5028 };

    // 1. Rank Candidate APMC Markets using 6-factor matrix
    const rankedMarkets = await MarketRankingService.rankMarkets(
      targetCommodityId,
      parsedEntity.quantityKg,
      parsedEntity.availabilityDays,
      farmerCoords
    );

    if (rankedMarkets.length === 0) {
      return res.status(404).json({ error: 'No APMC markets found in database.' });
    }

    const topMarket = rankedMarkets[0];

    // 2. Fetch Multi-day Forecast for Top Market
    const forecast = await PriceIntelligenceService.predictPrice(
      targetCommodityId,
      topMarket.marketId,
      parsedEntity.availabilityDays
    );

    // 3. Action Guidance (SELL NOW / WAIT / FIND BUYER NOW)
    const actionRecommendation = SellingGuidanceService.getRecommendation(
      forecast,
      parsedEntity.availabilityDays
    );

    // 4. Match Verified Bulk Buyers
    const matchedBuyers = await BuyerMatchingService.matchBuyers(
      parsedEntity.commodity,
      parsedEntity.quantityKg,
      'Grade A',
      farmerCoords
    );

    // 5. Transportation Estimate for Top Market (dynamic destination from topMarket)
    const topMarketDoc = await Market.findById(topMarket.marketId).lean();
    const topMarketCoords = topMarketDoc?.coordinates || { lat: 13.5504, lng: 78.5028 };

    const transportEstimate = TransportService.estimateTransport(
      farmerCoords,
      topMarketCoords,
      parsedEntity.quantityKg
    );

    return res.json({
      parsedInput: parsedEntity,
      currentPrice: forecast.currentModalPrice,
      forecast,
      actionRecommendation,
      rankedMarkets,
      topMarket,
      matchedBuyers,
      transportEstimate
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error generating recommendation' });
  }
};
