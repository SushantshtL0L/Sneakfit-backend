import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name?: string;
  description?: string;
  condition?: "new" | "thrift";
  image: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      trim: true,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    condition: {
      type: String,
      enum: ["new", "thrift"],
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);
