import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  id: string;
  name: string;
  type: 'light' | 'hvac' | 'appliance' | 'electronics' | 'water_heater';
  wattage: number;
  status: 'on' | 'off';
  usageHours: number;
  healthStatus?: 'good' | 'warning' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['light', 'hvac', 'appliance', 'electronics', 'water_heater'],
      required: true,
    },
    wattage: { type: Number, required: true },
    status: { type: String, enum: ['on', 'off'], default: 'off' },
    usageHours: { type: Number, default: 0 },
    healthStatus: {
      type: String,
      enum: ['good', 'warning', 'critical'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDevice>('Device', DeviceSchema);

