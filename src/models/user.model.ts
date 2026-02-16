import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  role: "user" | "admin" | "seller";
  image?: string;
  resetPasswordOTP?: string;
  resetPasswordOTPExpiry?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },
    image: {
      type: String,
      required: false,
    },
    resetPasswordOTP: {
      type: String,
      required: false,
    },
    resetPasswordOTPExpiry: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
