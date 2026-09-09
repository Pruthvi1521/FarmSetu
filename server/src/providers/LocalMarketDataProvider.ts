import { IMarketDataProvider } from './IMarketDataProvider';
import { MarketPrice } from '../models/MarketPrice';
import { MarketArrival } from '../models/MarketArrival';
import { Market } from '../models/Market';

export class LocalMarketDataProvider implements IMarketDataProvider {
  public async getCurrentPrice(commodityId: string, marketId: string): Promise<number | null> {
    const latest = await MarketPrice.findOne({ commodityId, marketId })
      .sort({ date: -1 })
      .lean();
    return latest ? latest.modalPrice : null;
  }

  public async getHistoricalPrices(
    commodityId: string,
    marketId: string,
    days: number = 30
  ): Promise<Array<{ date: string; price: number; minPrice: number; maxPrice: number; source: string }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const prices = await MarketPrice.find({
      commodityId,
      marketId,
      date: { $gte: startDate }
    })
      .sort({ date: 1 })
      .lean();

    return prices.map((p) => ({
      date: new Date(p.date).toISOString().split('T')[0],
      price: p.modalPrice,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      source: p.source
    }));
  }

  public async getRecentArrivals(
    commodityId: string,
    marketId: string,
    days: number = 7
  ): Promise<Array<{ date: Date; arrivalQuantityTonnes: number }>> {
    const arrivals = await MarketArrival.find({ commodityId, marketId })
      .sort({ date: -1 })
      .limit(days)
      .lean();

    return arrivals.map((a) => ({
      date: new Date(a.date),
      arrivalQuantityTonnes: a.arrivalQuantityTonnes
    }));
  }

  public async getAllMarkets(): Promise<any[]> {
    return Market.find({}).lean();
  }
}

export const defaultMarketDataProvider = new LocalMarketDataProvider();
