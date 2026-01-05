import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "user" | "admin";
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
