import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
  id: string;
  title: string;
  description: string;
  potentialSavings: number; // dollars per month
  priority: 'high' | 'medium' | 'low';
  category: 'device' | 'timing' | 'behavior' | 'upgrade';
  implemented: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    potentialSavings: { type: Number, required: true },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
    },
    category: {
      type: String,
      enum: ['device', 'timing', 'behavior', 'upgrade'],
      required: true,
    },
    implemented: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);

