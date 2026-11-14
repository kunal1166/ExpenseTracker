
import mongoose, { Document, Schema } from "mongoose";

export type Currency = "INR" | "USD" | "EUR" | "GBP";

export type DateFormat =
  | "DD/MM/YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  preferences: {
    currency: Currency;
    dateFormat: DateFormat;
  };

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    preferences: {
      currency: {
        type: String,
        enum: ["INR", "USD", "EUR", "GBP"],
        default: "INR",
      },

      dateFormat: {
        type: String,
        enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
        default: "DD/MM/YYYY",
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
