import { PORT } from "./config";
import app from "./app";
import { connectDB } from "./database";

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
