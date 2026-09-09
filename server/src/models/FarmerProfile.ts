import { Schema, model, Document } from 'mongoose';

export interface IFarmerProfileDocument extends Document {
  userId: Schema.Types.ObjectId;
  farmSizeAcres: number;
  preferredLanguage: string;
  bankAccountVerified: boolean;
}

const FarmerProfileSchema = new Schema<IFarmerProfileDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  farmSizeAcres: { type: Number, default: 5 },
  preferredLanguage: { type: String, default: 'en' },
  bankAccountVerified: { type: Boolean, default: true }
});

export const FarmerProfile = model<IFarmerProfileDocument>('FarmerProfile', FarmerProfileSchema);
