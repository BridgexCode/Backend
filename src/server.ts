import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db";

// Database connection
connectDB().then(async () => {
  const { default: app } = await import("./app");
  const PORT = process.env.PORT || 5000;

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});