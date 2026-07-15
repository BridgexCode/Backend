import mongoose from "mongoose";
import { AppError } from "../../common/errors/app-error.js";
import { getIO } from "../socket/socket.js";
import {
  CreateShipmentInput,
  ShipmentResponse,
  ShipmentStatus,
  ShipmentTimelineEvent,
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
  "delayed",
];

const mapShipmentResponse = (doc: any): ShipmentResponse => ({
  _id: doc._id.toString(),
  shipmentId: doc.shipmentId,
  orgId: doc.orgId.toString(),
  pickupLocation: doc.pickupLocation,
  destination: doc.destination,
  customerName: doc.customerName,
  assignedDriverId: doc.assignedDriverId?.toString(),
  assignedVehicleId: doc.assignedVehicleId?.toString(),
  assignedOperationsManagerId: doc.assignedOperationsManagerId?.toString(),
  expectedDeliveryDate: doc.expectedDeliveryDate,
  statusLifecycle: doc.statusLifecycle,
  timeline: doc.timeline || [],
  notes: doc.notes || "",
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const createShipment = async (
  data: CreateShipmentInput,
  organizationId: string,
  createdByUserId?: string,
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

  const timelineEvent = {
    status: "created" as ShipmentStatus,
    description: "Shipment created",
    updatedBy: createdByUserId ? new mongoose.Types.ObjectId(createdByUserId) : null,
    timestamp: now,
  };

  const doc: Record<string, unknown> = {
    shipmentId,
    orgId: new mongoose.Types.ObjectId(organizationId),
    pickupLocation: data.pickupLocation,
    destination: data.destination,
    customerName: data.customerName,
    expectedDeliveryDate: new Date(data.expectedDeliveryDate),
    assignedDriverId: data.assignedDriverId
      ? new mongoose.Types.ObjectId(data.assignedDriverId)
      : null,
    assignedVehicleId: data.assignedVehicleId
      ? new mongoose.Types.ObjectId(data.assignedVehicleId)
      : null,
    assignedOperationsManagerId: null,
    statusLifecycle: "created" as ShipmentStatus,
    timeline: [timelineEvent],
    notes: data.notes || "",
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("shipment").insertOne(doc);

  return mapShipmentResponse(doc);
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

  const data: ShipmentResponse[] = docs.map(mapShipmentResponse);

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

  return mapShipmentResponse(doc);
};

export const assignOperationsManager = async (
  shipmentObjectId: string,
  operationsManagerId: string,
  organizationId: string,
  updatedByUserId: string,
): Promise<ShipmentResponse> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;
  let managerId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(shipmentObjectId);
    managerId = new mongoose.Types.ObjectId(operationsManagerId);
  } catch {
    throw new AppError(400, "Invalid ID format");
  }

  // Verify shipment exists
  const shipment = await db.collection("shipment").findOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!shipment) {
    throw new AppError(404, "Shipment not found");
  }

  // Verify operations manager belongs to organization
  const member = await db.collection("member").findOne({
    userId: managerId,
    organizationId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!member) {
    throw new AppError(400, "Operations Manager not found in this organization");
  }

  const now = new Date();
  let newStatus = shipment.statusLifecycle;
  if (shipment.statusLifecycle === "created") {
    newStatus = "assigned";
  }

  const timelineEvent = {
    status: newStatus,
    description: "Operations Manager assigned to shipment",
    updatedBy: new mongoose.Types.ObjectId(updatedByUserId),
    timestamp: now,
  };

  await db.collection("shipment").updateOne(
    { _id: objectId },
    {
      $set: {
        assignedOperationsManagerId: managerId,
        statusLifecycle: newStatus,
        updatedAt: now,
      },
      $push: {
        timeline: timelineEvent,
      } as any,
    }
  );

  const updatedDoc = await db.collection("shipment").findOne({ _id: objectId });
  if (!updatedDoc) {
    throw new AppError(404, "Shipment not found after update");
  }

  return mapShipmentResponse(updatedDoc);
};

export const updateShipment = async (
  shipmentObjectId: string,
  data: Record<string, unknown>,
  organizationId: string,
  updatedByUserId: string,
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

  const shipment = await db.collection("shipment").findOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!shipment) {
    throw new AppError(404, "Shipment not found");
  }

  const allowedFields = ["pickupLocation", "destination", "customerName", "expectedDeliveryDate", "notes"];
  const $set: Record<string, unknown> = { updatedAt: new Date() };

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      $set[field] = data[field];
    }
  }

  const timelineEvent = {
    status: shipment.statusLifecycle,
    description: "Shipment details updated",
    updatedBy: new mongoose.Types.ObjectId(updatedByUserId),
    timestamp: new Date(),
  };

  await db.collection("shipment").updateOne(
    { _id: objectId },
    {
      $set,
      $push: {
        timeline: timelineEvent,
      } as any,
    }
  );

  const updatedDoc = await db.collection("shipment").findOne({ _id: objectId });
  if (!updatedDoc) {
    throw new AppError(404, "Shipment not found after update");
  }

  try {
    getIO().emit("shipment:updated", {
      _id: shipmentObjectId,
      status: updatedDoc.statusLifecycle,
      updatedAt: new Date().toISOString(),
    });
  } catch {}

  return mapShipmentResponse(updatedDoc);
};

export const assignDriver = async (
  shipmentObjectId: string,
  driverId: string,
  organizationId: string,
  updatedByUserId: string,
  vehicleId?: string,
): Promise<ShipmentResponse> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;
  let driverObjectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(shipmentObjectId);
    driverObjectId = new mongoose.Types.ObjectId(driverId);
  } catch {
    throw new AppError(400, "Invalid ID format");
  }

  const shipment = await db.collection("shipment").findOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!shipment) {
    throw new AppError(404, "Shipment not found");
  }

  const driver = await db.collection("driver").findOne({
    _id: driverObjectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!driver) {
    throw new AppError(400, "Driver not found in this organization");
  }

  const now = new Date();
  let newStatus = shipment.statusLifecycle;
  if (shipment.statusLifecycle === "created") {
    newStatus = "assigned";
  }

  const timelineEvent = {
    status: newStatus,
    description: `Driver ${driver.name || driver.driverId} assigned to shipment`,
    updatedBy: new mongoose.Types.ObjectId(updatedByUserId),
    timestamp: now,
  };

  const $set: Record<string, unknown> = {
    assignedDriverId: driverObjectId,
    statusLifecycle: newStatus,
    updatedAt: now,
  };
  if (vehicleId) {
    try {
      $set.assignedVehicleId = new mongoose.Types.ObjectId(vehicleId);
    } catch {}
  }

  await db.collection("shipment").updateOne(
    { _id: objectId },
    {
      $set,
      $push: {
        timeline: timelineEvent,
      } as any,
    }
  );

  const updatedDoc = await db.collection("shipment").findOne({ _id: objectId });
  if (!updatedDoc) {
    throw new AppError(404, "Shipment not found after update");
  }

  try {
    getIO().emit("shipment:updated", {
      _id: shipmentObjectId,
      status: updatedDoc.statusLifecycle,
      assignedDriverId: updatedDoc.assignedDriverId?.toString(),
      assignedVehicleId: updatedDoc.assignedVehicleId?.toString(),
      updatedAt: new Date().toISOString(),
    });
  } catch {}

  return mapShipmentResponse(updatedDoc);
};

export const updateShipmentStatus = async (
  shipmentObjectId: string,
  status: ShipmentStatus,
  organizationId: string,
  updatedByUserId: string,
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

  const shipment = await db.collection("shipment").findOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!shipment) {
    throw new AppError(404, "Shipment not found");
  }

  const now = new Date();
  const timelineEvent = {
    status,
    description: `Shipment status updated to: ${status.replace("_", " ")}`,
    updatedBy: new mongoose.Types.ObjectId(updatedByUserId),
    timestamp: now,
  };

  await db.collection("shipment").updateOne(
    { _id: objectId },
    {
      $set: {
        statusLifecycle: status,
        updatedAt: now,
      },
      $push: {
        timeline: timelineEvent,
      } as any,
    }
  );

  const updatedDoc = await db.collection("shipment").findOne({ _id: objectId });
  if (!updatedDoc) {
    throw new AppError(404, "Shipment not found after update");
  }

  try {
    getIO().emit("shipment:updated", {
      _id: shipmentObjectId,
      status: updatedDoc.statusLifecycle,
      updatedAt: new Date().toISOString(),
    });
  } catch {}

  return mapShipmentResponse(updatedDoc);
};

export const getOrganizationTimeline = async (
  organizationId: string,
): Promise<any[]> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const shipments = await db
    .collection("shipment")
    .find({ orgId: new mongoose.Types.ObjectId(organizationId) })
    .toArray();

  const allEvents: any[] = [];

  for (const shipment of shipments) {
    if (shipment.timeline && Array.isArray(shipment.timeline)) {
      for (const event of shipment.timeline) {
        allEvents.push({
          id: `${shipment._id}-${event.timestamp?.getTime() || Math.random()}-${event.status}`,
          shipmentId: shipment._id.toString(),
          trackingId: shipment.shipmentId,
          type: event.status === "created"
            ? "creation"
            : event.status === "assigned"
              ? "assignment"
              : event.status === "delivered"
                ? "delivery"
                : event.status === "cancelled"
                  ? "failed"
                  : "status",
          title: event.status === "created"
            ? "Shipment Created"
            : event.status === "assigned"
              ? "Shipment Assigned"
              : event.status === "delivered"
                ? "Shipment Delivered"
                : event.status === "cancelled"
                  ? "Shipment Cancelled"
                  : "Status Updated",
          description: event.description,
          timestamp: event.timestamp || new Date(),
          updatedBy: event.updatedBy?.toString() || null,
        });
      }
    }
  }

  const userIds = allEvents.map((e) => e.updatedBy).filter(Boolean);
  const userMap = new Map<string, string>();

  if (userIds.length > 0) {
    const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));
    const users = await db
      .collection("user")
      .find({ _id: { $in: objectIds } })
      .toArray();
    for (const u of users) {
      userMap.set(u._id.toString(), u.name || u.email || "User");
    }
  }

  for (const event of allEvents) {
    event.user = event.updatedBy ? userMap.get(event.updatedBy) || "System" : "System";
    const d = new Date(event.timestamp);
    event.timestamp = d.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  allEvents.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  return allEvents;
};
