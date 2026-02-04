import mongoose, { Schema, Document } from 'mongoose';

export interface IEnergyDataPoint extends Document {
  timestamp: Date;
  consumption: number; // kWh
  cost: number; // dollars
  deviceBreakdown: {
    deviceId: string;
    consumption: number;
  }[];
  createdAt: Date;
}

const DeviceBreakdownSchema = new Schema({
  deviceId: { type: String, required: true },
  consumption: { type: Number, required: true },
}, { _id: false });

const EnergyDataPointSchema = new Schema<IEnergyDataPoint>(
  {
    timestamp: { type: Date, required: true, index: true },
    consumption: { type: Number, required: true },
    cost: { type: Number, required: true },
    deviceBreakdown: [DeviceBreakdownSchema],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by timestamp
EnergyDataPointSchema.index({ timestamp: -1 });

export default mongoose.model<IEnergyDataPoint>('EnergyDataPoint', EnergyDataPointSchema);

