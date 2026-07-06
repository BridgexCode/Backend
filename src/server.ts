import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";

// Database connection
connectDB().then(async () => {

  const PORT = Number(process.env.PORT) || 5000;

  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});