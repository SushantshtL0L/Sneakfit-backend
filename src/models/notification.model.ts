import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
  user?: Schema.Types.ObjectId;
  title: string;
  message: string;
  type: "offer" | "announcement" | "general" | "order";
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false }, // Null means broadcast
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["offer", "announcement", "general", "order"],
      default: "general",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification>("Notification", notificationSchema);
