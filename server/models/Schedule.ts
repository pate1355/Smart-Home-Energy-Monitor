import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  id: string;
  deviceId: string;
  time: string; // "HH:MM" 24h format
  action: 'on' | 'off';
  days: number[]; // 0-6 (Sun-Sat)
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    id: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true },
    time: { type: String, required: true },
    action: {
      type: String,
      enum: ['on', 'off'],
      required: true,
    },
    days: [{ type: Number, min: 0, max: 6 }],
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);

