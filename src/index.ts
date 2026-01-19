import express from "express";
import cors from "cors";
import { PORT } from "./config";

import authRoutes from "./routes/auth.routes";
import { connectDB } from "./database";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

//  Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

