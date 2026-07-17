import TelegramBot from "node-telegram-bot-api";
import { handleMessage } from "./telegram.handlers.js";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
}

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  try {
    await handleMessage(bot, msg);
  } catch (error) {
    console.error("Telegram bot error:", error);
    bot.sendMessage(msg.chat.id, "❌ An unexpected error occurred. Please try again.");
  }
});

console.log("🤖 Telegram bot started successfully (polling mode)");

export default bot;
