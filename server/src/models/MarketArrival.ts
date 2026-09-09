import { Schema, model, Document } from 'mongoose';
import { DataType } from '../../../shared/types';

export interface IMarketArrivalDocument extends Document {
  marketId: Schema.Types.ObjectId;
  commodityId: Schema.Types.ObjectId;
  date: Date;
  arrivalQuantityTonnes: number;
  dataType: DataType;
}

const MarketArrivalSchema = new Schema<IMarketArrivalDocument>({
  marketId: { type: Schema.Types.ObjectId, ref: 'Market', required: true },
  commodityId: { type: Schema.Types.ObjectId, ref: 'Commodity', required: true },
  date: { type: Date, required: true },
  arrivalQuantityTonnes: { type: Number, required: true },
  dataType: { type: String, enum: ['OPEN_DATA', 'DEMO_DATA'], default: 'OPEN_DATA' }
});

export const MarketArrival = model<IMarketArrivalDocument>('MarketArrival', MarketArrivalSchema);
