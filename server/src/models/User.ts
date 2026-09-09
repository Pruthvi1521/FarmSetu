import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../../../shared/types';

export interface IUserDocument extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  location: {
    village?: string;
    city?: string;
    district: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['FARMER', 'BUYER', 'ADMIN'], required: true },
  location: {
    village: { type: String },
    city: { type: String },
    district: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = model<IUserDocument>('User', UserSchema);
