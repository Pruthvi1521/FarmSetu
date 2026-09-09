import { Schema, model, Document } from 'mongoose';

export interface IMarketDocument extends Document {
  name: string;
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  operatingDays: string[];
  apmcFeePercent: number;
}

const MarketSchema = new Schema<IMarketDocument>({
  name: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  operatingDays: [{ type: String }],
  apmcFeePercent: { type: Number, default: 1.0 }
});

export const Market = model<IMarketDocument>('Market', MarketSchema);
