import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SaleLot } from '../models/SaleLot';
import { Offer } from '../models/Offer';
import { Transaction } from '../models/Transaction';
import { Commodity } from '../models/Commodity';
import { Market } from '../models/Market';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from '../models/Notification';

// ─── Shared field validators ───────────────────────────────────────────────────

/**
 * Validates that a value is a finite positive number greater than zero.
 * Returns null if valid, or an error string if invalid.
 */
function validatePositiveNumber(value: unknown, fieldName: string): string | null {
  const n = Number(value);
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  if (!isFinite(n) || isNaN(n)) {
    return `${fieldName} must be a finite number`;
  }
  if (n <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  return null;
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── Create Lot ────────────────────────────────────────────────────────────────

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

    // ── Numeric validation ──
    const quantityErr = validatePositiveNumber(quantityKg, 'quantityKg');
    if (quantityErr) return res.status(400).json({ error: quantityErr });

    if (askingPricePerKg !== undefined && askingPricePerKg !== null && askingPricePerKg !== '') {
      const priceErr = validatePositiveNumber(askingPricePerKg, 'askingPricePerKg');
      if (priceErr) return res.status(400).json({ error: priceErr });
    }

    // ── Commodity resolution ──
    let targetCommodityId = commodityId;

    if (!targetCommodityId && commodityName) {
      const comm = await Commodity.findOne({ name: new RegExp(commodityName, 'i') });
      if (comm) targetCommodityId = comm._id.toString();
    }

    // Reject if commodity cannot be resolved
    if (!targetCommodityId) {
      return res.status(400).json({
        error: 'A valid commodityId or a recognized commodityName is required. Could not resolve the commodity.'
      });
    }

    if (!isValidObjectId(targetCommodityId)) {
      return res.status(400).json({ error: 'Invalid commodityId format' });
    }

    // Verify the resolved ID actually exists in the database
    const commodityExists = await Commodity.exists({ _id: targetCommodityId });
    if (!commodityExists) {
      return res.status(400).json({ error: 'Commodity not found. Please provide a valid commodityId.' });
    }

    const lot = await SaleLot.create({
      farmerId: req.user.id,
      commodityId: targetCommodityId,
      commodityName: commodityName || 'Unknown',
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

// ─── List Lots ─────────────────────────────────────────────────────────────────

export const getLots = async (req: Request, res: Response) => {
  try {
    const { crop, status } = req.query;
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

// ─── Lot Details ───────────────────────────────────────────────────────────────

export const getLotDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid lot ID format' });
    }

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

// ─── Get Offers for Lot ────────────────────────────────────────────────────────

export const getOffersForLot = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const id = req.params.id || req.params.lotId;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid lot ID format' });
    }

    const lot = await SaleLot.findById(id);
    if (!lot) {
      return res.status(404).json({ error: 'Lot not found' });
    }

    const isOwner = lot.farmerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isBuyer = req.user.role === 'BUYER';

    if (!isOwner && !isAdmin && !isBuyer) {
      return res.status(403).json({ error: 'You are not authorized to view offers for this lot' });
    }

    const filter: any = { lotId: id };
    if (isBuyer && !isOwner && !isAdmin) {
      filter.buyerId = req.user.id;
    }

    const offers = await Offer.find(filter)
      .populate('buyerId', 'name phone location')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(offers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching offers for lot' });
  }
};

// ─── Submit Offer ──────────────────────────────────────────────────────────────

export const submitOffer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== 'BUYER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only registered buyers can submit offers' });
    }

    const { id } = req.params; // lotId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid lot ID format' });
    }

    const { pricePerKg, transportationTerms, paymentTerms, validDays } = req.body;

    // ── Numeric validation ──
    const priceErr = validatePositiveNumber(pricePerKg, 'pricePerKg');
    if (priceErr) return res.status(400).json({ error: priceErr });

    const lot = await SaleLot.findById(id);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    // ── Status guard: only accept offers on genuinely open lots ──
    if (lot.status === 'SOLD') {
      return res.status(400).json({ error: 'This sale lot has already been sold.' });
    }
    if (lot.status === 'CANCELLED') {
      return res.status(400).json({ error: 'This sale lot has been cancelled and is no longer accepting offers.' });
    }

    const totalValue = Math.round(Number(pricePerKg) * lot.quantityKg);
    const validUntil = new Date(Date.now() + (validDays || 2) * 86400000);
    const buyerId = req.user.id;

    // ── Duplicate pending offer guard: upsert instead of creating duplicates ──
    const existingPending = await Offer.findOne({ lotId: id, buyerId, status: 'PENDING' });

    let offer: any;
    let isUpdate = false;

    if (existingPending) {
      existingPending.pricePerKg = Number(pricePerKg);
      existingPending.totalValue = totalValue;
      existingPending.transportationTerms = transportationTerms || existingPending.transportationTerms;
      existingPending.paymentTerms = paymentTerms || existingPending.paymentTerms;
      existingPending.validUntil = validUntil;
      await existingPending.save();
      offer = existingPending;
      isUpdate = true;
    } else {
      offer = await Offer.create({
        lotId: id,
        buyerId,
        pricePerKg: Number(pricePerKg),
        totalValue,
        transportationTerms: transportationTerms || 'BUYER_PICKUP',
        paymentTerms: paymentTerms || 'Immediate Cash / UPI',
        validUntil,
        status: 'PENDING'
      });

      if (lot.status !== 'OFFERS_RECEIVED') {
        lot.status = 'OFFERS_RECEIVED';
        await lot.save();
      }

      await createNotification({
        userId: lot.farmerId.toString(),
        type: 'NEW_OFFER',
        title: 'New Offer Received',
        message: `A buyer offered ₹${pricePerKg}/kg (Total ₹${totalValue.toLocaleString()}) for your ${lot.commodityName} lot (${lot.quantityKg} kg).`,
        link: `/farmer/offers?lotId=${lot._id}`
      });
    }

    const message = isUpdate ? 'Offer updated successfully' : 'Offer submitted successfully';
    return res.status(isUpdate ? 200 : 201).json({ message, offer });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error submitting offer' });
  }
};

// ─── Accept Offer ──────────────────────────────────────────────────────────────

export const acceptOffer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const { offerId } = req.params;
    if (!isValidObjectId(offerId)) {
      return res.status(400).json({ error: 'Invalid offer ID format' });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    const lot = await SaleLot.findById(offer.lotId);
    if (!lot) return res.status(404).json({ error: 'Associated lot not found' });

    // Authorization Guard: Only the lot-owning farmer or ADMIN can accept
    const isOwnerFarmer = req.user.role === 'FARMER' && lot.farmerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwnerFarmer && !isAdmin) {
      return res.status(403).json({ error: 'Only the farmer who published this lot or an Admin can accept offers.' });
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
    await createNotification({
      userId: offer.buyerId.toString(),
      type: 'OFFER_ACCEPTED',
      title: 'Your Offer Was Accepted!',
      message: `The farmer accepted your offer of ₹${offer.pricePerKg}/kg for ${lot.commodityName} (${lot.quantityKg} kg). A transaction has been created.`,
      link: `/buyer/transactions`
    });

    await createNotification({
      userId: lot.farmerId.toString(),
      type: 'LOT_SOLD',
      title: 'Sale Lot Marked as Sold',
      message: `Your ${lot.commodityName} lot (${lot.quantityKg} kg) has been sold for ₹${offer.totalValue.toLocaleString()}.`,
      link: `/farmer/transactions`
    });

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
        link: `/buyer/marketplace`
      });
    }

    return res.json({ message: 'Offer accepted and transaction created!', transaction });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error accepting offer' });
  }
};

// ─── Cancel Lot ────────────────────────────────────────────────────────────────

export const cancelLot = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid lot ID format' });
    }

    const lot = await SaleLot.findById(id);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    // Authorization: only the owning farmer or an admin can cancel
    const isOwnerFarmer = req.user.role === 'FARMER' && lot.farmerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwnerFarmer && !isAdmin) {
      return res.status(403).json({ error: 'Only the farmer who published this lot or an Admin can cancel it.' });
    }

    if (lot.status === 'SOLD') {
      return res.status(400).json({ error: 'A sold lot cannot be cancelled.' });
    }
    if (lot.status === 'CANCELLED') {
      return res.status(400).json({ error: 'This lot is already cancelled.' });
    }

    // Reject all pending offers and notify buyers
    const pendingOffers = await Offer.find({ lotId: lot._id, status: 'PENDING' }).lean();
    if (pendingOffers.length > 0) {
      await Offer.updateMany({ lotId: lot._id, status: 'PENDING' }, { status: 'REJECTED' });
      for (const pending of pendingOffers) {
        await createNotification({
          userId: pending.buyerId.toString(),
          type: 'OFFER_REJECTED',
          title: 'Lot Cancelled',
          message: `The farmer cancelled the ${lot.commodityName} lot (${lot.quantityKg} kg). Your offer has been withdrawn.`,
          link: `/buyer/marketplace`
        });
      }
    }

    lot.status = 'CANCELLED';
    await lot.save();

    return res.json({ message: 'Sale lot cancelled successfully', lot });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error cancelling lot' });
  }
};
