import mongoose, { Schema, Document } from 'mongoose';

interface GameSettings extends Document {
  gameId: string;
  time: string;
}

const GameSettingsSchema = new Schema<GameSettings>({
  gameId: { type: String, required: true, unique: true },
  time:   { type: String, required: true, default: '12:00 PM - 02:00 PM' },
}, { timestamps: true });

export const GameSettingsModel =
  (mongoose.models.GameSettings as mongoose.Model<GameSettings>) ??
  mongoose.model<GameSettings>('GameSettings', GameSettingsSchema);
