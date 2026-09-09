import { defaultMarketDataProvider } from '../providers/LocalMarketDataProvider';
import { IMarketDataProvider } from '../providers/IMarketDataProvider';
import { DemandRecord } from '../models/DemandRecord';
import { PriceIntelligenceService } from './PriceIntelligenceService';
import { TransportService } from './TransportService';
import { IMarketRankingItem, DemandLevel } from '../../../shared/types';

export class MarketRankingService {
  private static dataProvider: IMarketDataProvider = defaultMarketDataProvider;

  public static setDataProvider(provider: IMarketDataProvider) {
    this.dataProvider = provider;
  }

  /**
   * Ranks all candidate APMC markets for a farmer's crop lot
   */
  public static async rankMarkets(
    commodityId: string,
    quantityKg: number,
    availabilityDays: number,
    farmerCoords: { lat: number; lng: number }
  ): Promise<IMarketRankingItem[]> {
    const markets = await this.dataProvider.getAllMarkets();
    if (!markets || markets.length === 0) return [];

    const marketCandidates: {
      market: any;
      distanceKm: number;
      forecast: any;
      transportCost: number;
      apmcFee: number;
      expectedNetRevenue: number;
      demandLevel: DemandLevel;
    }[] = [];

    for (const m of markets) {
      const marketId = m._id ? m._id.toString() : m.id;
      // 1. Calculate transport cost
      const transportEst = TransportService.estimateTransport(farmerCoords, m.coordinates, quantityKg);
      const distanceKm = transportEst.distanceKm;
      const transportCost = transportEst.estimatedCost;

      // 2. Predict future price for target availabilityDays
      const forecast = await PriceIntelligenceService.predictPrice(
        commodityId,
        marketId,
        availabilityDays
      );

      // 3. Gross Revenue & APMC Fee
      const grossRevenue = quantityKg * forecast.forecastedPrice;
      const apmcFee = Math.round(grossRevenue * ((m.apmcFeePercent || 1.0) / 100));

      // 4. Expected Net Revenue
      const expectedNetRevenue = Math.round(grossRevenue - transportCost - apmcFee);

      // 5. Query Demand Record for market district
      const demandRec = await DemandRecord.findOne({
        commodityId,
        district: m.district
      }).lean();

      const demandLevel: DemandLevel = (demandRec?.demandLevel as DemandLevel) || 'MEDIUM';

      marketCandidates.push({
        market: m,
        distanceKm,
        forecast,
        transportCost,
        apmcFee,
        expectedNetRevenue,
        demandLevel
      });
    }

    // Min-Max Normalization setup
    const revs = marketCandidates.map((c) => c.expectedNetRevenue);
    const prices = marketCandidates.map((c) => c.forecast.forecastedPrice);
    const dists = marketCandidates.map((c) => c.distanceKm);

    const maxRev = Math.max(...revs);
    const minRev = Math.min(...revs);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const maxDist = Math.max(...dists);
    const minDist = Math.min(...dists);

    const ranked: IMarketRankingItem[] = marketCandidates.map((item) => {
      // 1. Revenue Score (40%)
      let revScore = 100;
      if (maxRev !== minRev) {
        revScore = ((item.expectedNetRevenue - minRev) / (maxRev - minRev)) * 100;
      }

      // 2. Price Score (20%)
      let priceScore = 100;
      if (maxPrice !== minPrice) {
        priceScore = ((item.forecast.forecastedPrice - minPrice) / (maxPrice - minPrice)) * 100;
      }

      // 3. Demand Score (15%)
      const demandScoreMap: Record<DemandLevel, number> = { HIGH: 100, MEDIUM: 65, LOW: 30 };
      const demandScore = demandScoreMap[item.demandLevel] || 65;

      // 4. Distance Score (10%) - Closer is better
      let distScore = 100;
      if (maxDist !== minDist) {
        distScore = (1 - (item.distanceKm - minDist) / (maxDist - minDist)) * 100;
      } else if (item.distanceKm > 100) {
        distScore = 60;
      }

      // 5. Trend Score (10%)
      const trendScoreMap = { INCREASING: 100, STABLE: 60, DECREASING: 20 };
      const trendScore = trendScoreMap[item.forecast.trend as 'INCREASING' | 'STABLE' | 'DECREASING'] || 60;

      // 6. Confidence Score (5%)
      const confidenceScore = item.forecast.confidenceScore || 75;

      // Weighted Recommendation Score (0 - 100)
      const totalScore = Math.round(
        0.4 * revScore +
          0.2 * priceScore +
          0.15 * demandScore +
          0.1 * distScore +
          0.1 * trendScore +
          0.05 * confidenceScore
      );

      // Generate explainable decision bullets
      const explanations: string[] = [];

      if (item.expectedNetRevenue >= maxRev * 0.95) {
        explanations.push(`✓ Highest expected net profit (₹${item.expectedNetRevenue.toLocaleString()}) after transport deductions`);
      } else {
        explanations.push(`✓ Competitive expected net profit of ₹${item.expectedNetRevenue.toLocaleString()}`);
      }

      if (item.forecast.trend === 'INCREASING') {
        explanations.push(`✓ Upward price trend expected in ${item.market.name}`);
      }

      if (item.demandLevel === 'HIGH') {
        explanations.push(`✓ Strong active buyer demand in ${item.market.district}`);
      }

      if (item.distanceKm <= 80) {
        explanations.push(`✓ Reasonable transportation distance (${item.distanceKm} km, ₹${item.transportCost.toLocaleString()} transport cost)`);
      }

      const mId = item.market._id ? item.market._id.toString() : item.market.id;

      return {
        marketId: mId,
        marketName: item.market.name,
        district: item.market.district,
        distanceKm: item.distanceKm,
        expectedPricePerKg: item.forecast.forecastedPrice,
        transportCost: item.transportCost,
        apmcFee: item.apmcFee,
        expectedNetRevenue: item.expectedNetRevenue,
        recommendationScore: totalScore,
        demandLevel: item.demandLevel,
        trend: item.forecast.trend,
        explanations
      };
    });

    // Sort by recommendation score descending
    return ranked.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }
}
