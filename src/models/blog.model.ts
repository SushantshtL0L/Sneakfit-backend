import { Schema, model, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  content: string;
  author: Schema.Types.ObjectId;
  image?: string;
  tags?: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String },
    tags: [{ type: String }],
    category: { type: String, required: true, default: "Sneaker Culture" },
  },
  { timestamps: true }
);

export const Blog = model<IBlog>("Blog", blogSchema);
