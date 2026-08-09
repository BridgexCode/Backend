import mongoose from "mongoose";
import { AppError } from "../../common/errors/app-error.js";
import { uploadImageFromUrl } from "../../lib/cloudinary.js";
import { getIO } from "../socket/socket.js";

export const findDriverByDriverId = async (driverId: string) => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const doc = await db.collection("driver").findOne({ driverId });
  return doc;
};

export const linkTelegramId = async (driverId: string, chatId: string) => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const result = await db.collection("driver").findOneAndUpdate(
    { driverId },
    { $set: { telegramId: chatId, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  return result;
};

export const getDriverShipments = async (driverObjectId: string) => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const objectId = new mongoose.Types.ObjectId(driverObjectId);

  const docs = await db
    .collection("shipment")
    .find({
      assignedDriverId: objectId,
      statusLifecycle: { $nin: ["delivered", "cancelled"] },
    })
    .sort({ createdAt: -1 })
    .toArray();

  return docs;
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  created: ["picked_up"],
  assigned: ["picked_up"],
  picked_up: ["in_transit"],
  in_transit: ["delivered", "delayed"],
};

export const updateShipmentStatusByDriver = async (
  shipmentObjectId: string,
  driverObjectId: string,
  newStatus: string,
) => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const shipment = await db.collection("shipment").findOne({
    _id: new mongoose.Types.ObjectId(shipmentObjectId),
    assignedDriverId: new mongoose.Types.ObjectId(driverObjectId),
  });

  if (!shipment) {
    return { success: false, message: "Shipment not found or not assigned to you" };
  }

  const currentStatus = shipment.statusLifecycle;
  const allowedNext = VALID_TRANSITIONS[currentStatus];

  if (!allowedNext || !allowedNext.includes(newStatus)) {
    return {
      success: false,
      message: `Cannot change status from "${currentStatus}" to "${newStatus}". Allowed: ${(allowedNext || ["none"]).join(", ")}`,
    };
  }

  const timelineEvent = {
    status: newStatus,
    description: `Driver updated status to: ${newStatus.replace("_", " ")} (via Telegram)`,
    updatedBy: new mongoose.Types.ObjectId(driverObjectId),
    timestamp: new Date(),
  };

  await db.collection("shipment").updateOne(
    { _id: new mongoose.Types.ObjectId(shipmentObjectId) },
    {
      $set: { statusLifecycle: newStatus, updatedAt: new Date() },
      $push: { timeline: timelineEvent as any },
    },
  );

  if (newStatus === "in_transit") {
    await db.collection("driver").updateOne(
      { _id: new mongoose.Types.ObjectId(driverObjectId) },
      { $set: { status: "on_trip", updatedAt: new Date() } },
    );
  }

  if (newStatus === "delivered") {
    await db.collection("driver").updateOne(
      { _id: new mongoose.Types.ObjectId(driverObjectId) },
      { $set: { status: "available", updatedAt: new Date() } },
    );
  }

  try {
    getIO().emit("shipment:updated", {
      _id: shipmentObjectId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch {}

  return { success: true, message: `✅ Status updated to "${newStatus.replace("_", " ")}"` };
};

export const storeLocation = async (
  shipmentObjectId: string,
  latitude: number,
  longitude: number,
) => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const locationEvent = {
    type: "location_update",
    coordinates: { latitude, longitude },
    timestamp: new Date(),
  };

  await db.collection("shipment").updateOne(
    { _id: new mongoose.Types.ObjectId(shipmentObjectId) },
    {
      $push: { locationHistory: locationEvent as any },
      $set: { updatedAt: new Date() },
    },
  );

  return { success: true, message: "📍 Location saved" };
};

export const uploadProofPhotoToCloudinary = async (
  fileUrl: string,
  driverId: string,
) => {
  const uploaded = await uploadImageFromUrl(
    fileUrl,
    `logiflow/proof-photos/${driverId}`,
  );

  return {
    cloudinaryAssetId: uploaded.asset_id,
    cloudinaryPublicId: uploaded.public_id,
    cloudinaryUrl: uploaded.secure_url,
    cloudinaryFormat: uploaded.format,
    cloudinaryBytes: uploaded.bytes,
  };
};

export const storeProofPhoto = async (
  shipmentObjectId: string,
  proofPhoto: {
    telegramFileId: string;
    cloudinaryAssetId?: string;
    cloudinaryPublicId: string;
    cloudinaryUrl: string;
    cloudinaryFormat?: string;
    cloudinaryBytes?: number;
  },
) => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const proofEvent = {
    type: "proof_photo",
    ...proofPhoto,
    timestamp: new Date(),
  };

  await db.collection("shipment").updateOne(
    { _id: new mongoose.Types.ObjectId(shipmentObjectId) },
    {
      $push: { proofPhotos: proofEvent as any },
      $set: { updatedAt: new Date() },
    },
  );

  return { success: true, message: "📸 Proof photo saved" };
};
