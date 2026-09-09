import { defaultMarketDataProvider, LocalMarketDataProvider } from '../providers/LocalMarketDataProvider';
import { IMarketDataProvider } from '../providers/IMarketDataProvider';
import { IPriceForecast } from '../../../shared/types';

export class PriceIntelligenceService {
  private static dataProvider: IMarketDataProvider = defaultMarketDataProvider;

  /**
   * Allows injecting alternative data provider (e.g. for testing)
   */
  public static setDataProvider(provider: IMarketDataProvider) {
    this.dataProvider = provider;
  }

  /**
   * Returns historical prices for a given commodity and market over N days
   */
  public static async getHistoricalPrices(commodityId: string, marketId: string, days: number = 30) {
    return this.dataProvider.getHistoricalPrices(commodityId, marketId, days);
  }

  /**
   * Predicts multi-day future price using WMA + Holt's Exponential Smoothing + Seasonality + Arrival Penalty
   */
  public static async predictPrice(
    commodityId: string,
    marketId: string,
    targetDays: number = 5
  ): Promise<IPriceForecast> {
    const historical = await this.dataProvider.getHistoricalPrices(commodityId, marketId, 60);

    if (!historical || historical.length === 0) {
      // Fallback default
      return {
        currentModalPrice: 30,
        forecastDate: new Date(Date.now() + targetDays * 86400000).toISOString().split('T')[0],
        forecastedPrice: 32,
        expectedMin: 29,
        expectedMax: 35,
        trend: 'STABLE',
        confidenceScore: 75,
        historicalPrices: []
      };
    }

    const currentModalPrice = historical[historical.length - 1].price;

    // 1. Weighted Moving Average (WMA) over the recent 7 days
    const recent7 = historical.slice(-7);
    const weights = [0.05, 0.08, 0.12, 0.15, 0.18, 0.20, 0.22];
    let wmaSum = 0;
    let weightSum = 0;

    recent7.forEach((item, idx) => {
      const w = weights[idx] || 0.1;
      wmaSum += item.price * w;
      weightSum += w;
    });

    const wmaBase = weightSum > 0 ? wmaSum / weightSum : currentModalPrice;

    // 2. Holt's Double Exponential Smoothing (Level + Trend)
    // Alpha: level smoothing (0.3), Beta: trend smoothing (0.1)
    const alpha = 0.3;
    const beta = 0.1;

    let level = historical[0].price;
    let trendComponent = historical.length > 1 ? historical[1].price - historical[0].price : 0;

    for (let t = 1; t < historical.length; t++) {
      const p = historical[t].price;
      const prevLevel = level;
      level = alpha * p + (1 - alpha) * (prevLevel + trendComponent);
      trendComponent = beta * (level - prevLevel) + (1 - beta) * trendComponent;
    }

    const holtForecast = level + targetDays * trendComponent;

    // 3. Seasonality Adjustment Factor (Monthly ratio over historical window)
    let seasonalityMultiplier = 1.0;
    if (historical.length >= 30) {
      const firstHalf = historical.slice(0, Math.floor(historical.length / 2));
      const secondHalf = historical.slice(Math.floor(historical.length / 2));

      const avg1 = firstHalf.reduce((acc, curr) => acc + curr.price, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((acc, curr) => acc + curr.price, 0) / secondHalf.length;

      if (avg1 > 0) {
        // Soft seasonal momentum adjustment
        seasonalityMultiplier = Math.min(1.15, Math.max(0.85, 1 + ((avg2 - avg1) / avg1) * 0.2));
      }
    }

    // 4. Arrival Volume Inversion Impact
    const recentArrivals = await this.dataProvider.getRecentArrivals(commodityId, marketId, 7);
    let arrivalPenalty = 0;
    if (recentArrivals.length >= 2) {
      const latestArrival = recentArrivals[0].arrivalQuantityTonnes;
      const prevArrivalAvg =
        recentArrivals.slice(1).reduce((acc, curr) => acc + curr.arrivalQuantityTonnes, 0) /
        (recentArrivals.length - 1);

      if (prevArrivalAvg > 0) {
        const arrivalDeltaPct = (latestArrival - prevArrivalAvg) / prevArrivalAvg;
        if (arrivalDeltaPct > 0.15) {
          // Inverse relationship: High surge in arrivals depresses price
          arrivalPenalty = arrivalDeltaPct * 0.8;
        }
      }
    }

    // 5. Ensemble Forecast Combination (50% WMA + 50% Holt) * Seasonality - ArrivalPenalty
    const ensemblePrice = (0.5 * wmaBase + 0.5 * holtForecast) * seasonalityMultiplier - arrivalPenalty;
    const forecastedPrice = Math.round(Math.max(5, ensemblePrice) * 10) / 10;

    // Price Variance & Confidence Score Calculation
    const variance =
      historical.reduce((acc, curr) => acc + Math.pow(curr.price - wmaBase, 2), 0) / historical.length;
    const stdDev = Math.sqrt(variance);

    // Confidence decays with higher volatility and longer targetDays horizon
    const confidenceScore = Math.min(
      95,
      Math.max(60, Math.round(92 - stdDev * 2.5 - targetDays * 1.5))
    );

    // Min-Max range based on standard deviation and horizon
    const rangeMargin = Math.max(0.05, Math.min(0.15, (stdDev / currentModalPrice) * 1.2 + targetDays * 0.008));
    const expectedMin = Math.round(forecastedPrice * (1 - rangeMargin) * 10) / 10;
    const expectedMax = Math.round(forecastedPrice * (1 + rangeMargin) * 10) / 10;

    // Trend classification
    let trend: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';
    const priceDiff = forecastedPrice - currentModalPrice;
    if (priceDiff > 0.8) trend = 'INCREASING';
    else if (priceDiff < -0.8) trend = 'DECREASING';

    const forecastDate = new Date(Date.now() + targetDays * 86400000).toISOString().split('T')[0];

    return {
      currentModalPrice,
      forecastDate,
      forecastedPrice,
      expectedMin,
      expectedMax,
      trend,
      confidenceScore,
      historicalPrices: historical.map((h) => ({ date: h.date, price: h.price }))
    };
  }
}
