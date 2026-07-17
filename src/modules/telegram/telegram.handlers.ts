import TelegramBot, { Message, KeyboardButton } from "node-telegram-bot-api";
import type { SendMessageParams } from "node-telegram-bot-api";
import * as TelegramService from "./telegram.service.js";

function escapeMarkdown(text: string): string {
  return text.replace(/[_*`]/g, "\\$&");
}

const sessions = new Map<number, { step: string; driverDoc?: any }>();

const mainMenuKeyboard: Omit<SendMessageParams, "chat_id" | "text"> = {
  reply_markup: {
    keyboard: [
      [{ text: "📦 My Shipments" }],
      [{ text: "🔄 Update Status" }],
      [{ text: "📍 Share Location" }],
      [{ text: "📸 Upload Proof" }],
      [{ text: "❓ Help" }],
    ] as KeyboardButton[][],
    resize_keyboard: true,
  },
};

export const handleMessage = async (bot: TelegramBot, msg: Message) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  const photo = msg.photo;

  if (!text && !photo) return;

  const session = sessions.get(chatId) || { step: "idle" };

  if (photo && session.step === "awaiting_photo" && session.driverDoc) {
    await handlePhotoUpload(bot, chatId, msg, session);
    return;
  }

  if (!text) return;

  if (text === "/start") {
    return handleStart(bot, chatId, session);
  }

  if (text === "📦 My Shipments" || text === "/shipments") {
    return handleMyShipments(bot, chatId, session);
  }

  if (text === "🔄 Update Status" || text === "/status") {
    return handleUpdateStatus(bot, chatId, session);
  }

  if (text === "📍 Share Location" || text === "/location") {
    return handleShareLocation(bot, chatId, session);
  }

  if (text === "📸 Upload Proof") {
    return handleUploadProof(bot, chatId, session);
  }

  if (text === "❓ Help" || text === "/help") {
    return handleHelp(bot, chatId);
  }

  if (session.step === "awaiting_driver_id") {
    return handleDriverIdInput(bot, chatId, text, session);
  }

  if (session.step === "awaiting_shipment_id") {
    return handleShipmentSelect(bot, chatId, text, session);
  }

  if (session.step === "awaiting_status") {
    return handleStatusSelect(bot, chatId, text, session);
  }

  if (text === "/picked" || text === "/transit" || text === "/delivered" || text === "/delayed") {
    return handleQuickStatus(bot, chatId, text, session);
  }

  bot.sendMessage(chatId, "Unknown command. Type /start to begin or /help for options.");
};

async function handleStart(bot: TelegramBot, chatId: number, session: any) {
  const chatIdStr = chatId.toString();
  const db = (await import("mongoose")).default.connection.db as any;
  if (db) {
    const existing = await db.collection("driver").findOne({ telegramId: chatIdStr });
    if (existing) {
      session.driverDoc = existing;
      session.step = "idle";
      sessions.set(chatId, session);
      bot.sendMessage(
        chatId,
        `👋 Welcome back, *${escapeMarkdown(existing.name)}*!\n\nChoose an option below:`,
        { parse_mode: "Markdown" as const, ...mainMenuKeyboard },
      );
      return;
    }
  }

  session.step = "awaiting_driver_id";
  sessions.set(chatId, session);
  bot.sendMessage(
    chatId,
    "👋 Welcome to *LogiFlow ERP*!\n\nPlease enter your *Driver ID* to link your account.\n(e.g., DRV001)",
    { parse_mode: "Markdown" },
  );
}

async function handleDriverIdInput(bot: TelegramBot, chatId: number, text: string, session: any) {
  try {
    const driver = await TelegramService.findDriverByDriverId(text.toUpperCase());

    if (!driver) {
      bot.sendMessage(chatId, "❌ Driver ID not found. Please check and try again.");
      return;
    }

    if (driver.telegramId) {
      bot.sendMessage(
        chatId,
        `⚠️ This Driver ID (*${escapeMarkdown(text.toUpperCase())}*) is already linked to another Telegram account.\nContact your admin if you need to re-link.`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    const chatIdStr = chatId.toString();
    await TelegramService.linkTelegramId(text.toUpperCase(), chatIdStr);

    session.driverDoc = driver;
    session.step = "idle";
    sessions.set(chatId, session);

    bot.sendMessage(
      chatId,
      `✅ *Account Linked Successfully!*\n\nWelcome *${escapeMarkdown(driver.name)}*\n\nChoose an option below:`,
      { parse_mode: "Markdown" as const, ...mainMenuKeyboard },
    );
  } catch (error: any) {
    bot.sendMessage(chatId, `❌ ${error.message || "Failed to link account"}`);
  }
}

async function handleMyShipments(bot: TelegramBot, chatId: number, session: any) {
  if (!session.driverDoc) {
    session.step = "awaiting_driver_id";
    sessions.set(chatId, session);
    bot.sendMessage(chatId, "⚠️ Please link your account first. Send /start");
    return;
  }

  try {
    const shipments = await TelegramService.getDriverShipments(session.driverDoc._id);

    if (shipments.length === 0) {
      bot.sendMessage(chatId, "📦 You have no active shipments assigned to you.");
      return;
    }

    let message = "*📦 Your Active Shipments:*\n\n";
    for (const s of shipments) {
      message += `• *${escapeMarkdown(s.shipmentId)}*\n`;
      message += `  From: ${escapeMarkdown(s.pickupLocation)}\n`;
      message += `  To: ${escapeMarkdown(s.destination)}\n`;
      message += `  Status: ${escapeMarkdown(s.statusLifecycle.replace("_", " "))}\n\n`;
    }

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error: any) {
    bot.sendMessage(chatId, `❌ ${error.message || "Failed to fetch shipments"}`);
  }
}

async function handleUpdateStatus(bot: TelegramBot, chatId: number, session: any) {
  if (!session.driverDoc) {
    session.step = "awaiting_driver_id";
    sessions.set(chatId, session);
    bot.sendMessage(chatId, "⚠️ Please link your account first. Send /start");
    return;
  }

  try {
    const shipments = await TelegramService.getDriverShipments(session.driverDoc._id);

    if (shipments.length === 0) {
      bot.sendMessage(chatId, "📦 No active shipments to update.");
      return;
    }

    let message = "*Select a shipment to update:*\n\n";
    for (let i = 0; i < shipments.length; i++) {
      message += `${i + 1}. ${escapeMarkdown(shipments[i].shipmentId)} - ${escapeMarkdown(shipments[i].statusLifecycle.replace("_", " "))}\n`;
    }
    message += `\nReply with the *number* (1-${shipments.length}) or the *Shipment ID*.`;

    session.step = "awaiting_shipment_id";
    session.shipments = shipments;
    sessions.set(chatId, session);

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error: any) {
    bot.sendMessage(chatId, `❌ ${error.message || "Failed to load shipments"}`);
  }
}

async function handleShipmentSelect(bot: TelegramBot, chatId: number, text: string, session: any) {
  let selectedShipment: any;

  const num = parseInt(text, 10);
  if (!isNaN(num) && num >= 1 && num <= session.shipments.length) {
    selectedShipment = session.shipments[num - 1];
  } else {
    selectedShipment = session.shipments.find(
      (s: any) => s.shipmentId.toUpperCase() === text.toUpperCase(),
    );
  }

  if (!selectedShipment) {
    bot.sendMessage(chatId, "❌ Invalid selection. Please try again.");
    return;
  }

  const current = selectedShipment.statusLifecycle;
  const statusOptions: Record<string, string[]> = {
    created: ["picked_up"],
    assigned: ["picked_up"],
    picked_up: ["in_transit"],
    in_transit: ["delivered", "delayed"],
  };

  const allowed = statusOptions[current];

  if (!allowed || allowed.length === 0) {
    bot.sendMessage(
      chatId,
      `❌ Cannot update status for "${escapeMarkdown(selectedShipment.shipmentId)}". Current status: "${escapeMarkdown(current)}".\nUse /help to see available commands.`,
    );
    session.step = "idle";
    sessions.set(chatId, session);
    return;
  }

  session.selectedShipment = selectedShipment;
  session.step = "awaiting_status";
  sessions.set(chatId, session);

  const options = allowed.map((s: string) => `/${s.replace("_", "\\_")}`);
  bot.sendMessage(
    chatId,
    `*Shipment:* ${escapeMarkdown(selectedShipment.shipmentId)}\n*Current Status:* ${escapeMarkdown(current.replace("_", " "))}\n\n*Select new status:*\n${options.join("\n")}\n\nOr type the status name.`,
    { parse_mode: "Markdown" },
  );
}

async function handleStatusSelect(bot: TelegramBot, chatId: number, text: string, session: any) {
  const statusMap: Record<string, string> = {
    "/picked_up": "picked_up",
    "picked_up": "picked_up",
    "/in_transit": "in_transit",
    "in_transit": "in_transit",
    "/delivered": "delivered",
    "delivered": "delivered",
    "/delayed": "delayed",
    "delayed": "delayed",
  };

  const normalizedInput = text.toLowerCase().replace(/\\/g, "");
  const newStatus = statusMap[normalizedInput];

  if (!newStatus) {
    bot.sendMessage(chatId, "❌ Invalid status. Use: /picked_up, /in_transit, /delivered, or /delayed");
    return;
  }

  try {
    const result = await TelegramService.updateShipmentStatusByDriver(
      session.selectedShipment._id,
      session.driverDoc._id,
      newStatus,
    );

    bot.sendMessage(chatId, result.message);

    session.step = "idle";
    session.selectedShipment = undefined;
    sessions.set(chatId, session);
  } catch (error: any) {
    bot.sendMessage(chatId, `❌ ${error.message || "Update failed"}`);
  }
}

async function handleQuickStatus(bot: TelegramBot, chatId: number, text: string, session: any) {
  if (!session.driverDoc) {
    bot.sendMessage(chatId, "⚠️ Please link your account first. Send /start");
    return;
  }

  bot.sendMessage(
    chatId,
    "Please use the menu option *🔄 Update Status* to select a shipment first.",
  );
}

async function handleShareLocation(bot: TelegramBot, chatId: number, session: any) {
  if (!session.driverDoc) {
    session.step = "awaiting_driver_id";
    sessions.set(chatId, session);
    bot.sendMessage(chatId, "⚠️ Please link your account first. Send /start");
    return;
  }

  session.step = "awaiting_location";
  sessions.set(chatId, session);
  bot.sendMessage(
    chatId,
    "📍 Please share your current location using the Telegram attachment button (📎) → Location.",
  );
}

async function handleUploadProof(bot: TelegramBot, chatId: number, session: any) {
  if (!session.driverDoc) {
    session.step = "awaiting_driver_id";
    sessions.set(chatId, session);
    bot.sendMessage(chatId, "⚠️ Please link your account first. Send /start");
    return;
  }

  session.step = "awaiting_photo";
  sessions.set(chatId, session);
  bot.sendMessage(chatId, "📸 Please send a photo as proof of delivery.");
}

async function handlePhotoUpload(bot: TelegramBot, chatId: number, msg: Message, session: any) {
  if (!msg.photo || msg.photo.length === 0) return;

  try {
    const shipments = await TelegramService.getDriverShipments(session.driverDoc._id);
    if (shipments.length === 0) {
      bot.sendMessage(chatId, "📦 No active shipments to attach proof to.");
      return;
    }

    const fileId = msg.photo[msg.photo.length - 1].file_id;

    for (const s of shipments) {
      await TelegramService.storeProofPhoto(s._id.toString(), fileId);
    }

    bot.sendMessage(chatId, "✅ Proof photo saved to your shipments.");

    session.step = "idle";
    sessions.set(chatId, session);
  } catch (error: any) {
    bot.sendMessage(chatId, `❌ ${error.message || "Failed to save photo"}`);
  }
}

async function handleHelp(bot: TelegramBot, chatId: number) {
  const helpText = `
*📖 LogiFlow Bot Help*

*Commands:*
/start - Link your account & show menu
📦 My Shipments - View active shipments
🔄 Update Status - Update shipment status
📍 Share Location - Share GPS location
📸 Upload Proof - Upload delivery photo
/help - Show this help

*Quick Status:*
/picked - Mark as picked up
/in\\_transit - Mark as in transit
/delivered - Mark as delivered
/delayed - Mark as delayed

*Status Flow:*
picked\\_up → in\\_transit → delivered
`;

  bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
}

export { sessions };
