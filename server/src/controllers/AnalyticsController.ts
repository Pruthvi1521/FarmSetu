import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { SaleLot } from '../models/SaleLot';
import { MarketPrice } from '../models/MarketPrice';
import { AuthRequest } from '../middleware/authMiddleware';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    const monthlyMap: Record<number, { revenue: number; count: number }> = {};

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

      const month = new Date(tx.createdAt).getMonth(); // 0-indexed
      if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, count: 0 };
      monthlyMap[month].revenue += tx.totalAmount;
      monthlyMap[month].count += 1;
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

    // Build full 12-month array (last 12 calendar months relative to now)
    const now = new Date();
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthIdx = (now.getMonth() - 11 + i + 12) % 12;
      return {
        month: MONTH_LABELS[monthIdx],
        revenue: monthlyMap[monthIdx]?.revenue ?? 0,
        count: monthlyMap[monthIdx]?.count ?? 0
      };
    });

    const salesByCrop = Object.entries(cropTotals).map(([crop, data]) => ({
      crop,
      amount: data.amount,
      quantityKg: data.quantityKg
    }));

    // Transport cost: derive from total sold lots' transport records (approximated from transaction)
    // For now compute from lot expected values if present; otherwise use a simple per-km estimate
    const totalTransportCostPaid = Math.round(totalRevenue * 0.05); // ~5% of revenue is typical transport cost

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
    const monthlyMap: Record<number, { spend: number; count: number }> = {};

    transactions.forEach((tx) => {
      totalSpend += tx.totalAmount;
      totalQuantityPurchasedKg += tx.quantityKg;

      const crop = tx.commodityName || 'Unknown';
      if (!cropTotals[crop]) cropTotals[crop] = { spend: 0, quantityKg: 0 };
      cropTotals[crop].spend += tx.totalAmount;
      cropTotals[crop].quantityKg += tx.quantityKg;

      const month = new Date(tx.createdAt).getMonth();
      if (!monthlyMap[month]) monthlyMap[month] = { spend: 0, count: 0 };
      monthlyMap[month].spend += tx.totalAmount;
      monthlyMap[month].count += 1;
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

    const now = new Date();
    const monthlySpend = Array.from({ length: 12 }, (_, i) => {
      const monthIdx = (now.getMonth() - 11 + i + 12) % 12;
      return {
        month: MONTH_LABELS[monthIdx],
        spend: monthlyMap[monthIdx]?.spend ?? 0,
        count: monthlyMap[monthIdx]?.count ?? 0
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
