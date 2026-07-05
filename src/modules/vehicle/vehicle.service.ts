import mongoose from "mongoose";
import { AppError } from "../../common/errors/app-error.js";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleResponse,
} from "./vehicle.types.js";

const mapVehicleResponse = (doc: any): VehicleResponse => ({
  _id: doc._id.toString(),
  orgId: doc.orgId.toString(),
  vehicleNumber: doc.vehicleNumber,
  vehicleModel: doc.vehicleModel,
  type: doc.type,
  driverId: doc.driverId?.toString(),
  status: doc.status,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const createVehicle = async (
  data: CreateVehicleInput,
  organizationId: string,
): Promise<VehicleResponse> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const existingVehicle = await db.collection("vehicle").findOne({
    orgId: new mongoose.Types.ObjectId(organizationId),
    vehicleNumber: data.vehicleNumber,
  });

  if (existingVehicle) {
    throw new AppError(400, "Vehicle number already exists");
  }

  const now = new Date();

  const doc = {
    orgId: new mongoose.Types.ObjectId(organizationId),
    vehicleNumber: data.vehicleNumber,
    vehicleModel: data.vehicleModel,
    type: data.type,
    driverId: data.driverId
      ? new mongoose.Types.ObjectId(data.driverId)
      : null,
    status: "available",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("vehicle").insertOne(doc);

  return mapVehicleResponse({
    ...doc,
    _id: result.insertedId,
  });
};

export const getAllVehicles = async (
  organizationId: string,
): Promise<VehicleResponse[]> => {
  if (!organizationId) {
    throw new AppError(400, "Organization ID is required");
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const docs = await db
    .collection("vehicle")
    .find({
      orgId: new mongoose.Types.ObjectId(organizationId),
    })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(mapVehicleResponse);
};

export const getVehicleById = async (
  vehicleId: string,
  organizationId: string,
): Promise<VehicleResponse> => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;

  try {
    objectId = new mongoose.Types.ObjectId(vehicleId);
  } catch {
    throw new AppError(400, "Invalid vehicle ID format");
  }

  const doc = await db.collection("vehicle").findOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!doc) {
    throw new AppError(404, "Vehicle not found");
  }

  return mapVehicleResponse(doc);
};

export const updateVehicle = async (
  vehicleId: string,
  data: UpdateVehicleInput,
  organizationId: string,
): Promise<VehicleResponse> => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;

  try {
    objectId = new mongoose.Types.ObjectId(vehicleId);
  } catch {
    throw new AppError(400, "Invalid vehicle ID format");
  }

  const vehicle = await db.collection("vehicle").findOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!vehicle) {
    throw new AppError(404, "Vehicle not found");
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.vehicleNumber !== undefined) {
    updateData.vehicleNumber = data.vehicleNumber;
  }

  if (data.vehicleModel !== undefined) {
    updateData.vehicleModel = data.vehicleModel;
  }

  if (data.type !== undefined) {
    updateData.type = data.type;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.driverId !== undefined) {
    updateData.driverId = data.driverId
      ? new mongoose.Types.ObjectId(data.driverId)
      : null;
  }

  await db.collection("vehicle").updateOne(
    { _id: objectId },
    {
      $set: updateData,
    },
  );

  const updatedDoc = await db.collection("vehicle").findOne({
    _id: objectId,
  });

  if (!updatedDoc) {
    throw new AppError(404, "Vehicle not found after update");
  }

  return mapVehicleResponse(updatedDoc);
};

export const deleteVehicle = async (
  vehicleId: string,
  organizationId: string,
): Promise<{ message: string }> => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;

  try {
    objectId = new mongoose.Types.ObjectId(vehicleId);
  } catch {
    throw new AppError(400, "Invalid vehicle ID format");
  }

  const result = await db.collection("vehicle").deleteOne({
    _id: objectId,
    orgId: new mongoose.Types.ObjectId(organizationId),
  });

  if (result.deletedCount === 0) {
    throw new AppError(404, "Vehicle not found");
  }

  return {
    message: "Vehicle deleted successfully",
  };
};