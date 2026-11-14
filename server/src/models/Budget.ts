import mongoose, { Document, Schema } from "mongoose";

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [0.01, "Budget must be greater than zero"],
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
      min: 2020,
    },
  },
  {
    timestamps: true,
  }
);

// One budget per category per user per month
budgetSchema.index(
  {
    userId: 1,
    category: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

const Budget = mongoose.model<IBudget>("Budget", budgetSchema);

export default Budget;