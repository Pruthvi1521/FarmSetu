import { Schema, model, Document } from 'mongoose';
import { DataType, DemandLevel } from '../../../shared/types';

export interface IDemandRecordDocument extends Document {
  district: string;
  commodityId: Schema.Types.ObjectId;
  demandLevel: DemandLevel;
  buyerCount: number;
  avgBuyerPrice: number;
  dataType: DataType;
}

const DemandRecordSchema = new Schema<IDemandRecordDocument>({
  district: { type: String, required: true },
  commodityId: { type: Schema.Types.ObjectId, ref: 'Commodity', required: true },
  demandLevel: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
  buyerCount: { type: Number, required: true },
  avgBuyerPrice: { type: Number, required: true },
  dataType: { type: String, enum: ['OPEN_DATA', 'DEMO_DATA'], default: 'OPEN_DATA' }
});

export const DemandRecord = model<IDemandRecordDocument>('DemandRecord', DemandRecordSchema);
