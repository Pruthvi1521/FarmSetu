import { Schema, model, Document } from 'mongoose';
import { TransactionStatus, TransportTerms } from '../../../shared/types';

export interface ITransactionDocument extends Document {
  lotId: Schema.Types.ObjectId;
  acceptedOfferId: Schema.Types.ObjectId;
  farmerId: Schema.Types.ObjectId;
  buyerId: Schema.Types.ObjectId;
  commodityName: string;
  quantityKg: number;
  agreedPricePerKg: number;
  totalAmount: number;
  transportationTerms: TransportTerms;
  status: TransactionStatus;
  timeline: {
    status: TransactionStatus;
    timestamp: Date;
    note: string;
  }[];
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>({
  lotId: { type: Schema.Types.ObjectId, ref: 'SaleLot', required: true },
  acceptedOfferId: { type: Schema.Types.ObjectId, ref: 'Offer', required: true },
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  commodityName: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  agreedPricePerKg: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  transportationTerms: { type: String, enum: ['BUYER_PICKUP', 'FARMER_DELIVERY'], required: true },
  status: {
    type: String,
    enum: ['OFFER_ACCEPTED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'],
    default: 'OFFER_ACCEPTED'
  },
  timeline: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export const Transaction = model<ITransactionDocument>('Transaction', TransactionSchema);
