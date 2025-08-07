import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityEntry {
  categoryId: mongoose.Types.ObjectId;
  level: 'inactive' | 'partially_active' | 'super_active';
}

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  entries: IActivityEntry[];
}

const ActivitySchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true, index: true },
  entries: [{
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    level: { type: String, enum: ['inactive', 'partially_active', 'super_active'], required: true }
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
ActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);