import { Schema, model, Document } from 'mongoose';
import { OfferStatus, TransportTerms } from '../../../shared/types';

export interface IOfferDocument extends Document {
  lotId: Schema.Types.ObjectId;
  buyerId: Schema.Types.ObjectId;
  pricePerKg: number;
  totalValue: number;
  transportationTerms: TransportTerms;
  paymentTerms: string;
  validUntil: Date;
  status: OfferStatus;
  createdAt: Date;
}

const OfferSchema = new Schema<IOfferDocument>({
  lotId: { type: Schema.Types.ObjectId, ref: 'SaleLot', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pricePerKg: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  transportationTerms: { type: String, enum: ['BUYER_PICKUP', 'FARMER_DELIVERY'], required: true },
  paymentTerms: { type: String, default: 'Immediate Cash / UPI' },
  validUntil: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

export const Offer = model<IOfferDocument>('Offer', OfferSchema);
