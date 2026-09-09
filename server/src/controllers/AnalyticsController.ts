import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { SaleLot } from '../models/SaleLot';
import { MarketPrice } from '../models/MarketPrice';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { TransportService } from '../services/TransportService';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Helper: build a rolling-12-month ordered list of YYYY-MM keys ─────────────

/**
 * Returns an array of 12 YYYY-MM strings covering the 12 most recent calendar
 * months, ordered chronologically (oldest first), e.g.:
 *   ['2025-10', '2025-11', ..., '2026-09']
 */
function buildRolling12MonthKeys(now: Date): string[] {
  const keys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    keys.push(`${year}-${month}`);
  }
  return keys;
}

/** Returns a YYYY-MM key for the given Date. */
function toYearMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// ─── Farmer Analytics ─────────────────────────────────────────────────────────

export const getFarmerAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const farmerId = req.user.id;

    // All transactions for this farmer regardless of status
    const transactions = await Transaction.find({ farmerId }).lean();

    // Completed/active transactions for revenue metrics
    const revenueTransactions = transactions.filter((tx) =>
      ['OFFER_ACCEPTED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(tx.status)
    );

    let totalRevenue = 0;
    let totalQuantitySoldKg = 0;
    let bestPriceRealizedPerKg = 0;
    const cropTotals: Record<string, { amount: number; quantityKg: number }> = {};

    // Year-aware monthly map: keyed by "YYYY-MM"
    const monthlyMap: Record<string, { revenue: number; count: number }> = {};

    revenueTransactions.forEach((tx) => {
      totalRevenue += tx.totalAmount;
      totalQuantitySoldKg += tx.quantityKg;
      if (tx.agreedPricePerKg > bestPriceRealizedPerKg) {
        bestPriceRealizedPerKg = tx.agreedPricePerKg;
      }

      const crop = tx.commodityName || 'Unknown';
      if (!cropTotals[crop]) cropTotals[crop] = { amount: 0, quantityKg: 0 };
      cropTotals[crop].amount += tx.totalAmount;
      cropTotals[crop].quantityKg += tx.quantityKg;

      const key = toYearMonthKey(new Date(tx.createdAt));
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, count: 0 };
      monthlyMap[key].revenue += tx.totalAmount;
      monthlyMap[key].count += 1;
    });

    const averagePricePerKg =
      totalQuantitySoldKg > 0
        ? Math.round((totalRevenue / totalQuantitySoldKg) * 10) / 10
        : 0;

    // Identify top crop
    let topCropSold = '';
    let maxCropRev = 0;
    Object.entries(cropTotals).forEach(([crop, data]) => {
      if (data.amount > maxCropRev) {
        maxCropRev = data.amount;
        topCropSold = crop;
      }
    });

    // Build rolling 12-month output array (chronological, year-aware)
    const now = new Date();
    const monthKeys = buildRolling12MonthKeys(now);
    const monthlyRevenue = monthKeys.map((key) => {
      const [yearStr, monthStr] = key.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1; // 0-indexed for MONTH_LABELS
      return {
        month: MONTH_LABELS[monthIdx],
        revenue: monthlyMap[key]?.revenue ?? 0,
        count: monthlyMap[key]?.count ?? 0
      };
    });

    const salesByCrop = Object.entries(cropTotals).map(([crop, data]) => ({
      crop,
      amount: data.amount,
      quantityKg: data.quantityKg
    }));

    // ─── Transport cost: derive from actual transaction data ─────────────────────
    // Strategy:
    //   - FARMER_DELIVERY: farmer pays transport → estimate via TransportService
    //     using farmer's and buyer's stored coordinates.
    //   - BUYER_PICKUP: buyer collects; farmer pays nothing → cost = 0.
    //   - If coordinates are unavailable, cost for that transaction = 0 (no fabrication).

    // Fetch farmer's coordinates once (needed for FARMER_DELIVERY transactions)
    const farmerUser = await User.findById(farmerId).lean();
    const farmerCoords = farmerUser?.location?.coordinates;

    let totalTransportCostPaid = 0;

    // Only process FARMER_DELIVERY transactions (BUYER_PICKUP = 0 cost to farmer)
    const farmerDeliveryTxs = revenueTransactions.filter(
      (tx) => tx.transportationTerms === 'FARMER_DELIVERY'
    );

    if (farmerDeliveryTxs.length > 0 && farmerCoords?.lat && farmerCoords?.lng) {
      // Batch-fetch buyer coordinates for involved buyers
      const buyerIds = [...new Set(farmerDeliveryTxs.map((tx) => tx.buyerId.toString()))];
      const buyerUsers = await User.find({ _id: { $in: buyerIds } })
        .select('location.coordinates')
        .lean();
      const buyerCoordsMap: Record<string, { lat: number; lng: number }> = {};
      buyerUsers.forEach((u) => {
        if (u.location?.coordinates?.lat && u.location?.coordinates?.lng) {
          buyerCoordsMap[u._id.toString()] = u.location.coordinates;
        }
      });

      for (const tx of farmerDeliveryTxs) {
        const buyerCoords = buyerCoordsMap[tx.buyerId.toString()];
        if (buyerCoords) {
          const estimate = TransportService.estimateTransport(
            farmerCoords,
            buyerCoords,
            tx.quantityKg
          );
          totalTransportCostPaid += estimate.estimatedCost;
        }
        // If buyer coordinates unavailable, add 0 (do not fabricate)
      }
    }

    return res.json({
      totalRevenue,
      totalSalesCount: revenueTransactions.length,
      totalQuantitySoldKg,
      averagePricePerKg,
      bestPriceRealizedPerKg,
      topCropSold: topCropSold || 'N/A',
      totalTransportCostPaid,
      monthlyRevenue,
      salesByCrop
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching analytics' });
  }
};

// ─── Buyer Analytics ──────────────────────────────────────────────────────────

export const getBuyerAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== 'BUYER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Buyer access required' });
    }

    const buyerId = req.user.id;

    const transactions = await Transaction.find({
      buyerId,
      status: { $in: ['OFFER_ACCEPTED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'] }
    }).lean();

    let totalSpend = 0;
    let totalQuantityPurchasedKg = 0;
    const cropTotals: Record<string, { spend: number; quantityKg: number }> = {};

    // Year-aware monthly map: keyed by "YYYY-MM"
    const monthlyMap: Record<string, { spend: number; count: number }> = {};

    transactions.forEach((tx) => {
      totalSpend += tx.totalAmount;
      totalQuantityPurchasedKg += tx.quantityKg;

      const crop = tx.commodityName || 'Unknown';
      if (!cropTotals[crop]) cropTotals[crop] = { spend: 0, quantityKg: 0 };
      cropTotals[crop].spend += tx.totalAmount;
      cropTotals[crop].quantityKg += tx.quantityKg;

      const key = toYearMonthKey(new Date(tx.createdAt));
      if (!monthlyMap[key]) monthlyMap[key] = { spend: 0, count: 0 };
      monthlyMap[key].spend += tx.totalAmount;
      monthlyMap[key].count += 1;
    });

    const averagePurchasePricePerKg =
      totalQuantityPurchasedKg > 0
        ? Math.round((totalSpend / totalQuantityPurchasedKg) * 10) / 10
        : 0;

    let topCommodityBought = '';
    let maxSpend = 0;
    Object.entries(cropTotals).forEach(([crop, data]) => {
      if (data.spend > maxSpend) {
        maxSpend = data.spend;
        topCommodityBought = crop;
      }
    });

    // Build rolling 12-month output array (chronological, year-aware)
    const now = new Date();
    const monthKeys = buildRolling12MonthKeys(now);
    const monthlySpend = monthKeys.map((key) => {
      const [, monthStr] = key.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      return {
        month: MONTH_LABELS[monthIdx],
        spend: monthlyMap[key]?.spend ?? 0,
        count: monthlyMap[key]?.count ?? 0
      };
    });

    const purchasesByCrop = Object.entries(cropTotals).map(([crop, data]) => ({
      crop,
      spend: data.spend,
      quantityKg: data.quantityKg
    }));

    return res.json({
      totalSpend,
      totalPurchasesCount: transactions.length,
      totalQuantityPurchasedKg,
      averagePurchasePricePerKg,
      topCommodityBought: topCommodityBought || 'N/A',
      monthlySpend,
      purchasesByCrop
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching buyer analytics' });
  }
};

// ─── Market Summary (for Market Intelligence page) ────────────────────────────

export const getMarketSummary = async (req: AuthRequest, res: Response) => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    // Aggregate average modal price per commodity over last 7 days, joining Commodity for name
    const priceAgg = await MarketPrice.aggregate([
      { $match: { date: { $gte: cutoff } } },
      {
        $group: {
          _id: '$commodityId',
          avgPrice: { $avg: '$modalPrice' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'commodities',
          localField: '_id',
          foreignField: '_id',
          as: 'commodity'
        }
      },
      { $unwind: { path: '$commodity', preserveNullAndEmptyArrays: true } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const totalActiveLots = await SaleLot.countDocuments({ status: { $in: ['ACTIVE', 'OFFERS_RECEIVED'] } });
    const lotValues = await SaleLot.aggregate([
      { $match: { status: { $in: ['ACTIVE', 'OFFERS_RECEIVED'] } } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$askingPricePerKg', '$quantityKg'] } } } }
    ]);

    return res.json({
      topCommodities: priceAgg.map((p) => ({
        name: p.commodity?.name || 'Unknown',
        avgPrice: Math.round(p.avgPrice * 10) / 10,
        trend: 'STABLE'
      })),
      totalActiveLotsCount: totalActiveLots,
      totalMarketplaceValue: Math.round(lotValues[0]?.totalValue || 0)
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching market summary' });
  }
};

// ─── Commodity Price History (for Market Intelligence chart) ──────────────────

export const getCommodityPriceTrend = async (req: AuthRequest, res: Response) => {
  try {
    const { commodityId, days } = req.query;
    if (!commodityId) return res.status(400).json({ error: 'commodityId is required' });

    const daysNum = days ? parseInt(days as string, 10) : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysNum);

    // Convert string ID to ObjectId for proper matching
    const mongoose = await import('mongoose');
    let commodityObjectId: any;
    try {
      commodityObjectId = new mongoose.Types.ObjectId(commodityId as string);
    } catch {
      return res.status(400).json({ error: 'Invalid commodityId format' });
    }

    // Aggregate by date: average modal price across all markets for this commodity
    const priceHistory = await MarketPrice.aggregate([
      {
        $match: {
          commodityId: commodityObjectId,
          date: { $gte: cutoff }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          avgModalPrice: { $avg: '$modalPrice' },
          avgMinPrice: { $avg: '$minPrice' },
          avgMaxPrice: { $avg: '$maxPrice' },
          marketCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.json(
      priceHistory.map((p) => ({
        date: p._id,
        avgModalPrice: Math.round(p.avgModalPrice * 10) / 10,
        avgMinPrice: Math.round(p.avgMinPrice * 10) / 10,
        avgMaxPrice: Math.round(p.avgMaxPrice * 10) / 10,
        marketCount: p.marketCount
      }))
    );
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching price trend' });
  }
};
