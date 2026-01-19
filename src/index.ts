import express from "express";
import { PORT } from "./config";

import authRoutes from "./routes/auth.routes";
import { connectDB } from "./database";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

//  Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

