
import mongoose, { Document, Schema } from "mongoose";

export type CategoryType = "income" | "expense";

export interface ICategory extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 40,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    icon: {
      type: String,
      default: "Wallet",
    },

    color: {
      type: String,
      default: "#64748b",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index(
  { userId: 1, name: 1, type: 1 },
  { unique: true }
);

const Category = mongoose.model<ICategory>(
  "Category",
  categorySchema
);

export default Category;
