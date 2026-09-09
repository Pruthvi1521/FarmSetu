import { Schema, model, Document } from 'mongoose';
import { LotStatus } from '../../../shared/types';

export interface ISaleLotDocument extends Document {
  farmerId: Schema.Types.ObjectId;
  commodityId: Schema.Types.ObjectId;
  commodityName: string;
  quantityKg: number;
  harvestDate: Date;
  availableDays: number;
  qualityGrade: string;
  askingPricePerKg?: number;
  expectedNetRevenue?: number;
  recommendedMarketId?: Schema.Types.ObjectId;
  recommendedMarketName?: string;
  status: LotStatus;
  createdAt: Date;
}

const SaleLotSchema = new Schema<ISaleLotDocument>({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  commodityId: { type: Schema.Types.ObjectId, ref: 'Commodity', required: true },
  commodityName: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  harvestDate: { type: Date, required: true },
  availableDays: { type: Number, default: 5 },
  qualityGrade: { type: String, default: 'Grade A' },
  askingPricePerKg: { type: Number },
  expectedNetRevenue: { type: Number },
  recommendedMarketId: { type: Schema.Types.ObjectId, ref: 'Market' },
  recommendedMarketName: { type: String },
  status: { type: String, enum: ['ACTIVE', 'OFFERS_RECEIVED', 'SOLD', 'CANCELLED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

export const SaleLot = model<ISaleLotDocument>('SaleLot', SaleLotSchema);
