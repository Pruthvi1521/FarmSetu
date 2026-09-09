import { Schema, model, Document } from 'mongoose';
import { DataType } from '../../../shared/types';

export interface IMarketPriceDocument extends Document {
  marketId: Schema.Types.ObjectId;
  commodityId: Schema.Types.ObjectId;
  date: Date;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  dataType: DataType;
  source: string;
}

const MarketPriceSchema = new Schema<IMarketPriceDocument>({
  marketId: { type: Schema.Types.ObjectId, ref: 'Market', required: true },
  commodityId: { type: Schema.Types.ObjectId, ref: 'Commodity', required: true },
  date: { type: Date, required: true },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  modalPrice: { type: Number, required: true },
  dataType: { type: String, enum: ['OPEN_DATA', 'DEMO_DATA'], default: 'OPEN_DATA' },
  source: { type: String, default: 'Agmarknet / Open Government Data Portal (data.gov.in)' }
});

MarketPriceSchema.index({ marketId: 1, commodityId: 1, date: -1 });

export const MarketPrice = model<IMarketPriceDocument>('MarketPrice', MarketPriceSchema);
