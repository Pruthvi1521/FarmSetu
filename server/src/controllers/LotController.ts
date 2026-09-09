import { Request, Response } from 'express';
import { SaleLot } from '../models/SaleLot';
import { Offer } from '../models/Offer';
import { Transaction } from '../models/Transaction';
import { Commodity } from '../models/Commodity';
import { Market } from '../models/Market';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from '../models/Notification';

export const createLot = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const {
      commodityId,
      commodityName,
      quantityKg,
      harvestDate,
      availableDays,
      qualityGrade,
      askingPricePerKg,
      expectedNetRevenue,
      recommendedMarketId,
      recommendedMarketName
    } = req.body;

    let targetCommodityId = commodityId;
    if (!targetCommodityId && commodityName) {
      const comm = await Commodity.findOne({ name: new RegExp(commodityName, 'i') });
      if (comm) targetCommodityId = comm._id.toString();
    }

    if (!quantityKg) {
      return res.status(400).json({ error: 'quantityKg is required' });
    }

    const lot = await SaleLot.create({
      farmerId: req.user.id,
      commodityId: targetCommodityId || '6aa16dc8bdfed49fb5a621c0',
      commodityName: commodityName || 'Tomato',
      quantityKg,
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      availableDays: availableDays || 5,
      qualityGrade: qualityGrade || 'Grade A',
      askingPricePerKg,
      expectedNetRevenue,
      recommendedMarketId,
      recommendedMarketName,
      status: 'ACTIVE'
    });

    return res.status(201).json({ message: 'Sale lot created successfully', lot });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error creating lot' });
  }
};

export const getLots = async (req: Request, res: Response) => {
  try {
    const { crop, status, district } = req.query;
    const filter: any = {};
    if (crop) filter.commodityName = new RegExp(crop as string, 'i');
    if (status) filter.status = status;

    const lots = await SaleLot.find(filter)
      .populate('farmerId', 'name phone location')
      .sort({ createdAt: -1 })
      .lean();

    // Attach offers count to each lot
    const lotsWithOffers = await Promise.all(
      lots.map(async (lot) => {
        const offersCount = await Offer.countDocuments({ lotId: lot._id });
        return { ...lot, offersCount };
      })
    );

    return res.json(lotsWithOffers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching lots' });
  }
};

export const getLotDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lot = await SaleLot.findById(id).populate('farmerId', 'name phone location').lean();
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    const offers = await Offer.find({ lotId: id })
      .populate('buyerId', 'name phone location')
      .sort({ pricePerKg: -1 })
      .lean();

    return res.json({ lot, offers });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching lot details' });
  }
};

export const submitOffer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== 'BUYER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only registered buyers can submit offers' });
    }

    const { id } = req.params; // lotId
    const { pricePerKg, transportationTerms, paymentTerms, validDays } = req.body;

    const lot = await SaleLot.findById(id);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    if (lot.status === 'SOLD' || lot.status === 'CANCELLED') {
      return res.status(400).json({ error: 'This sale lot is no longer accepting offers.' });
    }

    const totalValue = Math.round(pricePerKg * lot.quantityKg);
    const validUntil = new Date(Date.now() + (validDays || 2) * 86400000);

    const offer = await Offer.create({
      lotId: id,
      buyerId: req.user.id,
      pricePerKg,
      totalValue,
      transportationTerms: transportationTerms || 'BUYER_PICKUP',
      paymentTerms: paymentTerms || 'Immediate Cash / UPI',
      validUntil,
      status: 'PENDING'
    });

    // Update lot status to OFFERS_RECEIVED
    lot.status = 'OFFERS_RECEIVED';
    await lot.save();

    // --- Notification: alert the farmer about the new offer ---
    await createNotification({
      userId: lot.farmerId.toString(),
      type: 'NEW_OFFER',
      title: 'New Offer Received',
      message: `A buyer offered ₹${pricePerKg}/kg (Total ₹${totalValue.toLocaleString()}) for your ${lot.commodityName} lot (${lot.quantityKg} kg).`,
      link: `/farmer/offers?lotId=${lot._id}`
    });

    return res.status(201).json({ message: 'Offer submitted successfully', offer });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error submitting offer' });
  }
};

export const acceptOffer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const { offerId } = req.params;
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    const lot = await SaleLot.findById(offer.lotId);
    if (!lot) return res.status(404).json({ error: 'Associated lot not found' });

    // Authorization Guard: Only the lot's farmer or admin can accept
    if (req.user.role === 'FARMER' && lot.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the farmer who published this lot can accept offers.' });
    }

    // Conflict & Duplicate Guard: Prevent accepting offers on an already sold lot
    if (lot.status === 'SOLD') {
      return res.status(400).json({ error: 'This sale lot has already been sold to another buyer.' });
    }

    if (offer.status === 'ACCEPTED') {
      return res.status(400).json({ error: 'This offer has already been accepted.' });
    }

    if (offer.status === 'REJECTED' || offer.status === 'WITHDRAWN') {
      return res.status(400).json({ error: 'This offer is no longer valid.' });
    }

    // 1. Update accepted offer status
    offer.status = 'ACCEPTED';
    await offer.save();

    // 2. Conflict Resolution: Automatically reject all other pending offers for this lot
    await Offer.updateMany(
      { lotId: lot._id, _id: { $ne: offer._id }, status: 'PENDING' },
      { status: 'REJECTED' }
    );

    // 3. Update SaleLot status to SOLD
    lot.status = 'SOLD';
    await lot.save();

    // 4. Create Transaction state machine record
    const transaction = await Transaction.create({
      lotId: lot._id,
      acceptedOfferId: offer._id,
      farmerId: lot.farmerId,
      buyerId: offer.buyerId,
      commodityName: lot.commodityName,
      quantityKg: lot.quantityKg,
      agreedPricePerKg: offer.pricePerKg,
      totalAmount: offer.totalValue,
      transportationTerms: offer.transportationTerms,
      status: 'OFFER_ACCEPTED',
      timeline: [
        {
          status: 'OFFER_ACCEPTED',
          timestamp: new Date(),
          note: `Farmer accepted buyer offer of ₹${offer.pricePerKg}/kg (Total ₹${offer.totalValue.toLocaleString()}).`
        }
      ]
    });

    // --- Notifications ---
    // Winning buyer: offer accepted
    await createNotification({
      userId: offer.buyerId.toString(),
      type: 'OFFER_ACCEPTED',
      title: 'Your Offer Was Accepted!',
      message: `The farmer accepted your offer of ₹${offer.pricePerKg}/kg for ${lot.commodityName} (${lot.quantityKg} kg). A transaction has been created.`,
      link: `/transactions`
    });

    // Farmer: lot sold confirmation
    await createNotification({
      userId: lot.farmerId.toString(),
      type: 'LOT_SOLD',
      title: 'Sale Lot Marked as Sold',
      message: `Your ${lot.commodityName} lot (${lot.quantityKg} kg) has been sold for ₹${offer.totalValue.toLocaleString()}.`,
      link: `/farmer/transactions`
    });

    // Other rejected buyers
    const rejectedOffers = await Offer.find({
      lotId: lot._id,
      _id: { $ne: offer._id },
      status: 'REJECTED'
    }).lean();

    for (const rejected of rejectedOffers) {
      await createNotification({
        userId: rejected.buyerId.toString(),
        type: 'OFFER_REJECTED',
        title: 'Offer Not Selected',
        message: `Your offer on the ${lot.commodityName} lot (${lot.quantityKg} kg) was not selected. The farmer chose another buyer.`,
        link: `/marketplace`
      });
    }

    return res.json({ message: 'Offer accepted and transaction created!', transaction });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error accepting offer' });
  }
};
