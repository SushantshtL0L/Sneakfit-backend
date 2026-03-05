import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

export const connectDBTest = async (uri?: string): Promise<void> => {
  try {
    const connectUri = uri || MONGODB_URI + "_test";
    await mongoose.connect(connectUri);
  } catch (error) {
    console.error("❌ Test MongoDB connection failed", error);
    process.exit(1);
  }
};

export const closeDBTest = async (): Promise<void> => {
  try {
    if (mongoose.connection && mongoose.connection.db) {
      await mongoose.connection.dropDatabase();
    }
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Test MongoDB close failed", error);
    process.exit(1);
  }
};
