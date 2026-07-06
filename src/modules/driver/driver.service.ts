import mongoose from "mongoose";
import { AppError } from "../../common/errors/app-error.js";
import {
  CreateDriverInput,
  DriverResponse,
  DriverStatus,
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

export const getAllDrivers = async (
  organizationId: string,
): Promise<DriverResponse[]> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const docs = await db
    .collection("driver")
    .find({ orgId: new mongoose.Types.ObjectId(organizationId) })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(mapDriverResponse);
};

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