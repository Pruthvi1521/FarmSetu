import { Schema, model, Document } from 'mongoose';
import { BusinessType, VerificationStatus } from '../../../shared/types';

export interface IBuyerProfileDocument extends Document {
  userId: Schema.Types.ObjectId;
  businessName: string;
  businessType: BusinessType;
  verificationStatus: VerificationStatus;
  reliabilityScore: number;
  preferredCrops: string[];
  location: {
    city?: string;
    district: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

const BuyerProfileSchema = new Schema<IBuyerProfileDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true },
  businessType: { type: String, enum: ['WHOLESALER', 'RETAILER', 'PROCESSOR', 'RESTAURANT', 'INSTITUTION'], required: true },
  verificationStatus: { type: String, enum: ['VERIFIED', 'PENDING'], default: 'VERIFIED' },
  reliabilityScore: { type: Number, default: 95 },
  preferredCrops: [{ type: String }],
  location: {
    city: { type: String },
    district: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  }
});

export const BuyerProfile = model<IBuyerProfileDocument>('BuyerProfile', BuyerProfileSchema);
