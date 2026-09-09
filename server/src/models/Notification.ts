import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType } from '../../../shared/types';

export interface INotificationDoc extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['NEW_OFFER', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'LOT_SOLD', 'TRANSACTION_UPDATED', 'PRICE_ALERT'],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Index to efficiently fetch unread notifications for a user
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotificationDoc>('Notification', notificationSchema);

/**
 * Helper: create a notification record (fire-and-forget safe).
 * Errors are logged but never bubble up to break the calling business logic.
 */
export async function createNotification(params: {
  userId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  try {
    await Notification.create(params);
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err);
  }
}
