import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  id: string;
  type: 'spike' | 'goal' | 'recommendation' | 'achievement' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    id: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['spike', 'goal', 'recommendation', 'achievement', 'info', 'success'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ timestamp: -1 });
NotificationSchema.index({ read: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

