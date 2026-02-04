import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number; // kWh
  current: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    id: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGoal>('Goal', GoalSchema);

