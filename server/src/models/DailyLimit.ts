
import mongoose, { Document, Schema } from "mongoose";

export interface IDailyLimit extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const dailyLimitSchema = new Schema<IDailyLimit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: [true, "Daily spending limit is required"],
      min: [1, "Daily limit must be greater than zero"],
    },
  },
  {
    timestamps: true,
  }
);

const DailyLimit = mongoose.model<IDailyLimit>(
  "DailyLimit",
  dailyLimitSchema
);

export default DailyLimit;
