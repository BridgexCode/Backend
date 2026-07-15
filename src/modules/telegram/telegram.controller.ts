import { Request, Response, NextFunction } from "express";

export const webhookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const sendNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { chatId, message } = req.body;

    if (!chatId || !message) {
      res.status(400).json({ error: "chatId and message are required" });
      return;
    }

    const bot = (await import("./telegram.bot.js")).default;
    await bot.sendMessage(chatId, message);

    res.status(200).json({ success: true, message: "Notification sent" });
  } catch (error) {
    next(error);
  }
};
