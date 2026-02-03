import { connectDB } from "@/database";
import mongoose from "mongoose";

// before all test starts
beforeAll(async () => {
    // can connect to test database or other test engines
    await connectDB();
});

// after all tests are done
afterAll(async () => {
    await mongoose.connection.close();
});