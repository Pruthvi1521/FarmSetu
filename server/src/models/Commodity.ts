import { Schema, model, Document } from 'mongoose';
import { CommodityCategory } from '../../../shared/types';

export interface ICommodityDocument extends Document {
  name: string;
  category: CommodityCategory;
  unit: string;
  shelfLifeDays: number;
  grades: string[];
  icon?: string;
}

const CommoditySchema = new Schema<ICommodityDocument>({
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['VEGETABLE', 'GRAIN', 'PULSE', 'FRUIT'], required: true },
  unit: { type: String, default: 'kg' },
  shelfLifeDays: { type: Number, default: 7 },
  grades: [{ type: String }],
  icon: { type: String }
});

export const Commodity = model<ICommodityDocument>('Commodity', CommoditySchema);
