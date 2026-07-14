import mongoose from "mongoose";
import { AppError } from "../../common/errors/app-error.js";
import {
  OrganizationResponse,
  DashboardResponse,
} from "./superAdmin.types.js";

const mapOrganizationResponse = (doc: any): OrganizationResponse => ({
  _id: doc._id.toString(),
  name: doc.name,
  status: doc.status,
  slug: doc.slug,
  metadata: doc.metadata,
  createdAt: doc.createdAt,
});

export const getAllOrganizations = async (): Promise<
  OrganizationResponse[]
> => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const docs = await db
    .collection("organization")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(mapOrganizationResponse);
};

export const getOrganizationById = async (
  organizationId: string,
): Promise<OrganizationResponse> => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;

  try {
    objectId = new mongoose.Types.ObjectId(organizationId);
  } catch {
    throw new AppError(400, "Invalid organization ID format");
  }

  const doc = await db.collection("organization").findOne({
    _id: objectId,
  });

  if (!doc) {
    throw new AppError(404, "Organization not found");
  }

  return mapOrganizationResponse(doc);
};

export const getDashboardStats =
  async (): Promise<DashboardResponse> => {
    const db = mongoose.connection.db;

    if (!db) {
      throw new AppError(500, "Database connection not ready");
    }

    const [
      totalOrganizations
    ] = await Promise.all([
      db.collection("organization").countDocuments()
    ]);

    return {
      totalOrganizations
    };
  };

  export const updateOrganizationStatus = async (
  organizationId: string,
  status: "active" | "inactive",
): Promise<OrganizationResponse> => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;

  try {
    objectId = new mongoose.Types.ObjectId(organizationId);
  } catch {
    throw new AppError(400, "Invalid organization ID format");
  }

  const organization = await db.collection("organization").findOne({
    _id: objectId,
  });

  if (!organization) {
    throw new AppError(404, "Organization not found");
  }

  await db.collection("organization").updateOne(
    { _id: objectId },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
  );

  const updatedOrganization = await db.collection("organization").findOne({
    _id: objectId,
  });

  if (!updatedOrganization) {
    throw new AppError(404, "Organization not found after update");
  }

  return mapOrganizationResponse(updatedOrganization);
};

export const deleteOrganization = async (
  organizationId: string,
): Promise<{ message: string }> => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let objectId: mongoose.Types.ObjectId;

  try {
    objectId = new mongoose.Types.ObjectId(organizationId);
  } catch {
    throw new AppError(400, "Invalid organization ID format");
  }

  const result = await db.collection("organization").deleteOne({
    _id: objectId,
  });

  if (result.deletedCount === 0) {
    throw new AppError(404, "Organization not found");
  }

  return {
    message: "Organization deleted successfully",
  };
};