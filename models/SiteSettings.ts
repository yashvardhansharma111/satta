import mongoose, { Schema, Document } from 'mongoose';

interface SiteSettings extends Document {
  key:   string;
  value: string;
}

const SiteSettingsSchema = new Schema<SiteSettings>(
  {
    key:   { type: String, required: true, unique: true },
    value: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SiteSettingsModel =
  (mongoose.models.SiteSettings as mongoose.Model<SiteSettings>) ??
  mongoose.model<SiteSettings>('SiteSettings', SiteSettingsSchema);
