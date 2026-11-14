import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "income" | "expense";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Transaction title is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;