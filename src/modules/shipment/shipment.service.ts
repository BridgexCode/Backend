import mongoose from "mongoose";
import { AppError } from "../../common/errors/app-error.js";
import {
  CreateShipmentInput,
  ShipmentResponse,
  ShipmentStatus,
} from "./shipment.types.js";

const generateShipmentId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SHP-${timestamp}-${random}`;
};

const VALID_STATUSES: ShipmentStatus[] = [
  "created",
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled",
];

export const createShipment = async (
  data: CreateShipmentInput,
  organizationId: string,
): Promise<ShipmentResponse> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const shipmentId = generateShipmentId();
  const now = new Date();

  const doc = {
    shipmentId,
    orgId: new mongoose.Types.ObjectId(organizationId),
    pickupLocation: data.pickupLocation,
    destination: data.destination,
    customerName: data.customerName,
    expectedDeliveryDate: new Date(data.expectedDeliveryDate),
    assignedDriverId: data.assignedDriverId
      ? new mongoose.Types.ObjectId(data.assignedDriverId)
      : undefined,
    statusLifecycle: "created" as ShipmentStatus,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("shipment").insertOne(doc);

  return {
    _id: doc.shipmentId,
    shipmentId: doc.shipmentId,
    orgId: doc.orgId.toString(),
    pickupLocation: doc.pickupLocation,
    destination: doc.destination,
    customerName: doc.customerName,
    assignedDriverId: doc.assignedDriverId?.toString(),
    expectedDeliveryDate: doc.expectedDeliveryDate,
    statusLifecycle: doc.statusLifecycle,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export const getShipments = async (
  organizationId: string,
  query: { page?: string; limit?: string; status?: string },
): Promise<{ data: ShipmentResponse[]; total: number; page: number; limit: number }> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    orgId: new mongoose.Types.ObjectId(organizationId),
  };

  if (query.status && VALID_STATUSES.includes(query.status as ShipmentStatus)) {
    filter.statusLifecycle = query.status;
  }

  const [docs, total] = await Promise.all([
    db
      .collection("shipment")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("shipment").countDocuments(filter),
  ]);

  const data: ShipmentResponse[] = docs.map((doc) => ({
    _id: doc._id.toString(),
    shipmentId: doc.shipmentId,
    orgId: doc.orgId.toString(),
    pickupLocation: doc.pickupLocation,
    destination: doc.destination,
    customerName: doc.customerName,
    assignedDriverId: doc.assignedDriverId?.toString(),
    expectedDeliveryDate: doc.expectedDeliveryDate,
    statusLifecycle: doc.statusLifecycle,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));

  return { data, total, page, limit };
};

export const getShipmentById = async (
  shipmentObjectId: string,
  organizationId: string,
): Promise<ShipmentResponse> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(shipmentObjectId);
  } catch {
    throw new AppError(400, "Invalid shipment ID format");
  }

  const doc = await db.collection("shipment").findOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!doc) {
    throw new AppError(404, "Shipment not found");
  }

  return {
    _id: doc._id.toString(),
    shipmentId: doc.shipmentId,
    orgId: doc.orgId.toString(),
    pickupLocation: doc.pickupLocation,
    destination: doc.destination,
    customerName: doc.customerName,
    assignedDriverId: doc.assignedDriverId?.toString(),
    expectedDeliveryDate: doc.expectedDeliveryDate,
    statusLifecycle: doc.statusLifecycle,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};
