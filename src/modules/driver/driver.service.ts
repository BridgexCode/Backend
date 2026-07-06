import mongoose from "mongoose";
import { AppError } from "../../common/errors/app-error.js";
import {
  CreateDriverInput,
  DriverQuery,
  DriverResponse,
  DriverStatus,
  UpdateDriverInput,
} from "./driver.types.js";

const VALID_STATUSES: DriverStatus[] = [
  "available",
  "on_trip",
  "inactive",
];

const mapDriverResponse = (doc: any): DriverResponse => ({
  _id: doc._id.toString(),
  orgId: doc.orgId.toString(),
  name: doc.name,
  phone: doc.phone,
  licenseNumber: doc.licenseNumber,
  vehicleNumber: doc.vehicleNumber,
  status: doc.status,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const createDriver = async (
  data: CreateDriverInput,
  organizationId: string,
): Promise<DriverResponse> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;

  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw new AppError(400, "Invalid driver status");
  }

  const now = new Date();

  const doc = {
    _id: new mongoose.Types.ObjectId(),
    orgId: new mongoose.Types.ObjectId(organizationId),
    name: data.name,
    phone: data.phone,
    licenseNumber: data.licenseNumber,
    vehicleNumber: data.vehicleNumber,
    status: data.status || "available",
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("driver").insertOne(doc);

  return mapDriverResponse(doc);
};

export const getDrivers = async (
  organizationId: string,
  query: DriverQuery,
): Promise<{ data: DriverResponse[]; total: number; page: number; limit: number }> => {
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

  const filter: Record<string, any> = {
    orgId: new mongoose.Types.ObjectId(organizationId),
  };

  if (query.status && VALID_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { licenseNumber: searchRegex },
      { vehicleNumber: searchRegex },
    ];
  }

  const [docs, total] = await Promise.all([
    db
      .collection("driver")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("driver").countDocuments(filter),
  ]);

  const data: DriverResponse[] = docs.map(mapDriverResponse);

  return { data, total, page, limit };
};

export const getDriverById = async (
  driverObjectId: string,
  organizationId: string,
): Promise<DriverResponse> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(driverObjectId);
  } catch {
    throw new AppError(400, "Invalid driver ID format");
  }

  const doc = await db.collection("driver").findOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!doc) {
    throw new AppError(404, "Driver not found");
  }

  return mapDriverResponse(doc);
};

export const updateDriver = async (
  driverObjectId: string,
  data: UpdateDriverInput,
  organizationId: string,
): Promise<DriverResponse> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(driverObjectId);
  } catch {
    throw new AppError(400, "Invalid driver ID format");
  }

  const driver = await db.collection("driver").findOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!driver) {
    throw new AppError(404, "Driver not found");
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw new AppError(400, "Invalid driver status");
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updates.name = data.name;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.licenseNumber !== undefined) updates.licenseNumber = data.licenseNumber;
  if (data.vehicleNumber !== undefined) updates.vehicleNumber = data.vehicleNumber;
  if (data.status !== undefined) updates.status = data.status;

  const updatedDoc = await db.collection("driver").findOneAndUpdate(
    { _id: objectId },
    { $set: updates },
    { returnDocument: "after" },
  );

  if (!updatedDoc) {
    throw new AppError(404, "Driver not found after update");
  }

  return mapDriverResponse(updatedDoc);
};

export const deleteDriver = async (
  driverObjectId: string,
  organizationId: string,
): Promise<void> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(driverObjectId);
  } catch {
    throw new AppError(400, "Invalid driver ID format");
  }

  const result = await db.collection("driver").deleteOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (result.deletedCount === 0) {
    throw new AppError(404, "Driver not found");
  }
};