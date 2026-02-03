import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
<<<<<<< HEAD
  username: string;
=======
>>>>>>> sprint-2
  email: string;
  username: string;
  password: string;
  role: "user" | "admin";
  image?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
<<<<<<< HEAD
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
=======
>>>>>>> sprint-2
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
      enum: ["user", "admin"],
      default: "user",
    },
    image: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
