import mongoose from "mongoose";
import { getAuth } from "../../lib/auth.js";
import { AppError, BadRequestError } from "../../common/errors/app-error.js";
import { Roles } from "../../common/constants/roles.js";
import { CreateUserInput } from "./user.types.js";

export const createUser = async (
  data: CreateUserInput,
  organizationId: string,
  createdBy: string
) => {
  const { name, email, phone, password, role } = data;

  if (!organizationId) {
    throw new AppError(400, "Organization ID not found");
  }

  const db = mongoose.connection.db;

  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  if (email) {
    const existingEmail = await db.collection("user").findOne({ email });

    if (existingEmail) {
      throw new BadRequestError("Email already exists");
    }
  }

  if (phone) {
    const existingPhone = await db
      .collection("user")
      .findOne({ phoneNumber: phone });

    if (existingPhone) {
      throw new BadRequestError("Phone number already exists");
    }
  }

  const auth = await getAuth();

  let createdUser: any;

  if (role === Roles.OPERATIONS_MANAGER) {
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    createdUser = result.user;
  }

  if (role === Roles.WORKER) {
    const workerEmail = email || `${phone}@worker.local`;
    const workerPassword = password || `Worker@${Date.now()}`;

    const result = await auth.api.signUpEmail({
      body: {
        name,
        email: workerEmail,
        password: workerPassword,
      },
    });

    createdUser = result.user;

    await db.collection("user").updateOne(
      { id: createdUser.id },
      {
        $set: {
          phoneNumber: phone,
        },
      }
    );
  }

  if (!createdUser) {
    throw new AppError(500, "User creation failed");
  }

  await db.collection("member").insertOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    userId: createdUser.id,
    role:
      role === Roles.ORGANIZATION_OWNER
        ? "owner"
        : role === Roles.OPERATIONS_MANAGER
        ? "member"
        : "worker",
    customRole: role,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    phone,
    role,
    organizationId,
    isActive: true,
  };
};