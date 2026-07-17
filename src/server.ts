import dotenv from "dotenv";
dotenv.config();

import http from "http";
import connectDB from "./config/db.js";
import app from "./app.js";
import { initSocketIO } from "./modules/socket/socket.js";
import { seedSuperAdmin } from "./modules/superAdmin/superAdmin.seed.js";

// Database connection
connectDB().then(async () => {

  await seedSuperAdmin();

  const PORT = Number(process.env.PORT) || 5000;

  // Create HTTP server and attach Socket.IO
  const server = http.createServer(app);
  initSocketIO(server);

  // Start Telegram bot
  const { default: bot } = await import("./modules/telegram/telegram.bot.js");

  // Start server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});