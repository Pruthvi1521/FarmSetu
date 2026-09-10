import mongoose, { Schema, Document } from 'mongoose';
import { BookingVehicleType, BookingStatus } from '../../../shared/types';

export interface ITransportBookingDocument extends Document {
  farmerId: mongoose.Types.ObjectId;
  transactionId: mongoose.Types.ObjectId;
  saleLotId: mongoose.Types.ObjectId;
  pickupLocation: string;
  destinationLocation: string;
  distanceKm: number;
  quantityKg: number;
  vehicleType: BookingVehicleType;
  vehicleLabel: string;
  ratePerKm: number;
  estimatedCost: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TransportBookingSchema = new Schema<ITransportBookingDocument>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
    saleLotId: { type: Schema.Types.ObjectId, ref: 'SaleLot', required: true },
    pickupLocation: { type: String, required: true },
    destinationLocation: { type: String, required: true },
    distanceKm: { type: Number, required: true, min: 0 },
    quantityKg: { type: Number, required: true, min: 0 },
    vehicleType: {
      type: String,
      enum: ['TRACTOR', 'SMALL_TRUCK', 'MEDIUM_TRUCK'],
      required: true
    },
    vehicleLabel: { type: String, required: true },
    ratePerKm: { type: Number, required: true, min: 0 },
    estimatedCost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['REQUESTED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'],
      default: 'REQUESTED'
    }
  },
  { timestamps: true }
);

export const TransportBooking = mongoose.model<ITransportBookingDocument>(
  'TransportBooking',
  TransportBookingSchema
);
