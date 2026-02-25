import mongoose, { Schema } from 'mongoose';

export type ChartCell = {
  topDigits: [string, string, string];
  main: string;
  bottomDigits: [string, string, string];
  isRed: boolean;
};

export type ChartRow = {
  startDate: Date;
  endDate: Date;
  cells: ChartCell[];
  createdAt: Date;
  updatedAt: Date;
};

const ChartCellSchema = new Schema<ChartCell>(
  {
    topDigits: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 3,
      },
    },
    main: { type: String, required: true },
    bottomDigits: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 3,
      },
    },
    isRed: { type: Boolean, required: true },
  },
  { _id: false }
);

const ChartRowSchema = new Schema<ChartRow>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    cells: {
      type: [ChartCellSchema],
      required: true,
      validate: {
        validator: (v: ChartCell[]) => v.length === 7,
      },
    },
  },
  { timestamps: true }
);

ChartRowSchema.index({ startDate: 1, endDate: 1 }, { unique: true });

export const ChartRowModel =
  (mongoose.models.ChartRow as mongoose.Model<ChartRow>) ||
  mongoose.model<ChartRow>('ChartRow', ChartRowSchema);
