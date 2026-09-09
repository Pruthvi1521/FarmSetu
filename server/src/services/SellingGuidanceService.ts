import { ActionRecommendation, IPriceForecast } from '../../../shared/types';

export class SellingGuidanceService {
  /**
   * Generates SELL_NOW / WAIT / FIND_BUYER_NOW action recommendation
   */
  public static getRecommendation(
    forecast: IPriceForecast,
    availabilityDays: number,
    shelfLifeDays: number = 7
  ): {
    action: ActionRecommendation;
    title: string;
    rationale: string;
    targetDays: number;
  } {
    const currentPrice = forecast.currentModalPrice;
    const forecastedPrice = forecast.forecastedPrice;
    const priceGrowthPct = ((forecastedPrice - currentPrice) / currentPrice) * 100;

    if (priceGrowthPct >= 8 && availabilityDays < shelfLifeDays) {
      return {
        action: 'WAIT',
        title: `WAIT ${availabilityDays > 0 ? availabilityDays : 2} DAYS BEFORE SELLING`,
        rationale: `Model forecast predicts prices will rise from ₹${currentPrice}/kg to ₹${forecastedPrice}/kg (+${Math.round(priceGrowthPct)}% gain). Storage is feasible.`,
        targetDays: availabilityDays > 0 ? availabilityDays : 2
      };
    } else if (priceGrowthPct <= -5) {
      return {
        action: 'SELL_NOW',
        title: 'SELL IMMEDIATELY AT LOCAL MANDI',
        rationale: `Market arrivals are surging and prices are projected to soften by ${Math.abs(Math.round(priceGrowthPct))}%. Lock in current peak prices now.`,
        targetDays: 0
      };
    } else {
      return {
        action: 'FIND_BUYER_NOW',
        title: 'FIND DIRECT BULK BUYER NOW',
        rationale: `Mandi prices are stable around ₹${currentPrice}/kg. Direct verified bulk buyers offer premium bids with zero APMC commission and included pickup.`,
        targetDays: 1
      };
    }
  }
}
