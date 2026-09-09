export interface IMarketDataProvider {
  getCurrentPrice(commodityId: string, marketId: string): Promise<number | null>;
  getHistoricalPrices(
    commodityId: string,
    marketId: string,
    days?: number
  ): Promise<Array<{ date: string; price: number; minPrice: number; maxPrice: number; source: string }>>;
  getRecentArrivals(
    commodityId: string,
    marketId: string,
    days?: number
  ): Promise<Array<{ date: Date; arrivalQuantityTonnes: number }>>;
  getAllMarkets(): Promise<any[]>;
}
