import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name?: string;
  description?: string;
  condition?: "new" | "thrift";
  price?: number;
  brand?: string;
  image: string;
  seller: Schema.Types.ObjectId;
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
    brand: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
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
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);
