import { Request, Response } from 'express';
import { TransportBooking } from '../models/TransportBooking';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { createNotification } from '../models/Notification';
import { transportProvider } from '../providers/LocalTransportProvider';
import { BookingVehicleType, BookingStatus, VEHICLE_LABELS } from '../../../shared/types';
import { TransportService } from '../services/TransportService';

export class TransportController {
  /**
   * GET /api/transport/estimate?distanceKm=100&quantityKg=2000
   * Calculates cost estimate based on distance and quantity.
   */
  public static async getEstimate(req: Request, res: Response): Promise<void> {
    try {
      const distanceKm = parseFloat(req.query.distanceKm as string) || 50;
      const quantityKg = parseFloat(req.query.quantityKg as string) || 1000;

      // Dummy coordinates based on distanceKm to leverage TransportService
      const farmerCoords = { lat: 18.5204, lng: 73.8567 };
      // approx ~ 1 deg lat = 111 km
      const deltaLat = distanceKm / 111;
      const destCoords = { lat: 18.5204 + deltaLat, lng: 73.8567 };

      const estimate = transportProvider.estimateTransport(farmerCoords, destCoords, quantityKg);
      res.json({ success: true, data: estimate });
    } catch (err: any) {
      console.error('[TransportController] getEstimate error:', err);
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  /**
   * GET /api/transport/recommend-vehicle?quantityKg=2500
   */
  public static async getVehicleRecommendation(req: Request, res: Response): Promise<void> {
    try {
      const quantityKg = parseFloat(req.query.quantityKg as string) || 1000;
      const recommendation = transportProvider.recommendVehicle(quantityKg);
      res.json({ success: true, data: recommendation });
    } catch (err: any) {
      console.error('[TransportController] getVehicleRecommendation error:', err);
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  /**
   * POST /api/transport/bookings
   * Creates a transport booking for an accepted transaction.
   */
  public static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, pickupLocation, destinationLocation } = req.body;

      if (!transactionId) {
        res.status(400).json({ success: false, message: 'transactionId is required' });
        return;
      }

      const transaction = await Transaction.findById(transactionId)
        .populate('farmerId')
        .populate('buyerId')
        .populate('lotId');

      if (!transaction) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }

      // Check existing booking
      const existing = await TransportBooking.findOne({ transactionId });
      if (existing) {
        res.json({ success: true, data: existing, message: 'Booking already exists for this transaction' });
        return;
      }

      // Extract details
      const farmerObj = transaction.farmerId as any;
      const buyerObj = transaction.buyerId as any;
      const lotObj = transaction.lotId as any;

      const farmerCoords = farmerObj?.location?.coordinates || { lat: 18.5204, lng: 73.8567 };
      const buyerCoords = buyerObj?.location?.coordinates || { lat: 19.0760, lng: 72.8777 };

      const pickupStr = pickupLocation || farmerObj?.location?.district || 'Farmer Location';
      const destStr = destinationLocation || buyerObj?.location?.district || 'Buyer Location';

      const estimate = transportProvider.estimateTransport(farmerCoords, buyerCoords, transaction.quantityKg);
      const vehicleRec = transportProvider.recommendVehicle(transaction.quantityKg);

      const booking = await TransportBooking.create({
        farmerId: farmerObj._id,
        transactionId: transaction._id,
        saleLotId: lotObj?._id || transaction.lotId,
        pickupLocation: pickupStr,
        destinationLocation: destStr,
        distanceKm: estimate.distanceKm,
        quantityKg: transaction.quantityKg,
        vehicleType: vehicleRec.vehicleType,
        vehicleLabel: vehicleRec.vehicleLabel,
        ratePerKm: estimate.ratePerKm,
        estimatedCost: estimate.estimatedCost,
        status: 'REQUESTED'
      });

      // Send notification to buyer
      if (buyerObj?._id) {
        await createNotification({
          userId: buyerObj._id,
          type: 'TRANSPORT_BOOKING_REQUESTED',
          title: 'Transport Arranged',
          message: `Transport arranged for ${transaction.commodityName} (${vehicleRec.vehicleLabel})`,
          link: '/buyer/transactions'
        });
      }

      res.status(201).json({ success: true, data: booking });
    } catch (err: any) {
      console.error('[TransportController] createBooking error:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to create transport booking' });
    }
  }

  /**
   * GET /api/transport/farmer-bookings
   * Returns transport bookings for the authenticated farmer or query user.
   */
  public static async getFarmerBookings(req: Request, res: Response): Promise<void> {
    try {
      const farmerId = (req as any).user?._id || req.query.farmerId;
      const filter = farmerId ? { farmerId } : {};

      const bookings = await TransportBooking.find(filter)
        .populate('transactionId')
        .sort({ createdAt: -1 });

      res.json({ success: true, data: bookings });
    } catch (err: any) {
      console.error('[TransportController] getFarmerBookings error:', err);
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  /**
   * GET /api/transport/bookings/:transactionId
   * Returns booking for a specific transaction ID.
   */
  public static async getBookingByTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const booking = await TransportBooking.findOne({ transactionId }).populate('transactionId');
      if (!booking) {
        res.status(404).json({ success: false, message: 'No transport booking found for this transaction' });
        return;
      }
      res.json({ success: true, data: booking });
    } catch (err: any) {
      console.error('[TransportController] getBookingByTransaction error:', err);
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  /**
   * PATCH /api/transport/bookings/:id/status
   * Updates status of a transport booking and syncs transaction timeline.
   */
  public static async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (user && user.role === 'BUYER') {
        res.status(403).json({ success: false, message: 'Buyers are not authorized to update transport status' });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      const validStatuses: BookingStatus[] = ['REQUESTED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        return;
      }

      const booking = await TransportBooking.findById(id);
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }

      // Enforce strict state machine progression: REQUESTED -> ASSIGNED -> IN_TRANSIT -> DELIVERED
      const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
        REQUESTED: ['ASSIGNED'],
        ASSIGNED: ['IN_TRANSIT'],
        IN_TRANSIT: ['DELIVERED'],
        DELIVERED: []
      };

      const currentStatus = booking.status;
      if (!allowedTransitions[currentStatus]?.includes(status as BookingStatus)) {
        res.status(400).json({
          success: false,
          message: `Invalid transport status transition from '${currentStatus}' to '${status}'. Allowed next status: ${allowedTransitions[currentStatus]?.join(', ') || 'None (Terminal)'}`
        });
        return;
      }

      booking.status = status;
      await booking.save();

      // Sync transaction status if appropriate
      const transaction = await Transaction.findById(booking.transactionId);
      if (transaction) {
        let updatedTxStatus = transaction.status;
        if (status === 'IN_TRANSIT' && transaction.status !== 'IN_TRANSIT') {
          updatedTxStatus = 'IN_TRANSIT';
        } else if (status === 'DELIVERED' && transaction.status !== 'DELIVERED') {
          updatedTxStatus = 'DELIVERED';
        }

        if (updatedTxStatus !== transaction.status) {
          transaction.status = updatedTxStatus;
          transaction.timeline.push({
            status: updatedTxStatus,
            timestamp: new Date(),
            note: `Status updated via transport system to ${status}`
          });
          await transaction.save();
        }

        // Send notifications
        await createNotification({
          userId: (booking.farmerId as any)?._id || booking.farmerId,
          type: 'TRANSPORT_STATUS_UPDATED',
          title: 'Transport Status Updated',
          message: `Transport for your shipment is now ${status.replace('_', ' ')}`,
          link: '/farmer/transactions'
        });

        if (transaction.buyerId) {
          await createNotification({
            userId: (transaction.buyerId as any)?._id || transaction.buyerId,
            type: 'TRANSPORT_STATUS_UPDATED',
            title: 'Transport Status Updated',
            message: `Shipment status updated to ${status.replace('_', ' ')}`,
            link: '/buyer/transactions'
          });
        }
      }

      res.json({ success: true, data: booking });
    } catch (err: any) {
      console.error('[TransportController] updateBookingStatus error:', err);
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
}
