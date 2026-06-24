import mongoose from "mongoose";
import { getAuth } from "../../lib/auth.js";
import { AppError, BadRequestError } from "../../common/errors/app-error.js";
import { Roles, Role } from "../../common/constants/roles.js";
import { CreateUserInput } from "./user.types.js";
import User from "../../models/User.js";
import { AuthenticatedUser } from "../auth/auth.types.js";

interface UpdateUserPayload {
  name?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
}

export const createUser = async (
  data: CreateUserInput,
  organizationId: string,
  createdBy: string,
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
  }

  if (!createdUser) {
    throw new AppError(500, "User creation failed");
  }

  if (phone) {
    await db.collection("user").updateOne(
      { _id: new mongoose.Types.ObjectId(createdUser.id) },
      {
        $set: {
          phoneNumber: phone,
          phone: phone,
        },
      },
    );
  }

  await db.collection("member").insertOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    userId: new mongoose.Types.ObjectId(createdUser.id),
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

export const softDeleteUser = async (
  userId: string,
  currentUser: AuthenticatedUser
) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);

  const user = await db.collection("user").findOne({ _id: userIdObj });
  if (!user || user.isDeleted) {
    throw new AppError(404, "User not found");
  }

  const member = await db.collection("member").findOne({
    userId: userIdObj,
  });

  const role = member?.customRole || member?.role;

  // Authorization check
  if (currentUser.role !== Roles.SUPER_ADMIN) {
    if (currentUser.role !== Roles.ORGANIZATION_OWNER) {
      throw new AppError(403, "Unauthorized");
    }

    if (
      member?.organizationId?.toString() !==
      currentUser.organizationId?.toString()
    ) {
      throw new AppError(403, "Unauthorized");
    }
  }

  if (role === Roles.SUPER_ADMIN || role === "SUPER_ADMIN") {
    throw new BadRequestError("Super Admin cannot be deleted");
  }

  const updatedUser = await db.collection("user").findOneAndUpdate(
    { _id: userIdObj },
    { $set: { isDeleted: true, isActive: false, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    throw new AppError(404, "User not found");
  }

  return {
    id: updatedUser._id.toString(),
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone || updatedUser.phoneNumber || "",
    role: role || Roles.WORKER,
    organizationId: member?.organizationId?.toString(),
    isActive: updatedUser.isActive,
    isDeleted: updatedUser.isDeleted,
  };
};

export const updateUser = async (
  userId: string,
  updateData: UpdateUserPayload,
  currentUser: AuthenticatedUser
) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);

  const user = await db.collection("user").findOne({ _id: userIdObj });
  if (!user || user.isDeleted) {
    throw new AppError(404, "User not found");
  }

  const targetMember = await db.collection("member").findOne({
    userId: userIdObj,
  });

  const targetRole = targetMember?.customRole || targetMember?.role;
  const targetOrgId = targetMember?.organizationId;

  if (currentUser.role !== Roles.SUPER_ADMIN) {
    if (currentUser.role !== Roles.ORGANIZATION_OWNER) {
      throw new AppError(403, "Unauthorized");
    }

    if (
      targetOrgId?.toString() !==
      currentUser.organizationId?.toString()
    ) {
      throw new AppError(403, "Unauthorized");
    }

    if (targetRole === Roles.SUPER_ADMIN || targetRole === "SUPER_ADMIN") {
      throw new BadRequestError("Cannot update super admin");
    }
  }

  const userUpdates: Record<string, unknown> = {};
  if (updateData.name !== undefined) {
    userUpdates.name = updateData.name;
  }
  if (updateData.phone !== undefined) {
    userUpdates.phone = updateData.phone;
    userUpdates.phoneNumber = updateData.phone;
  }
  if (updateData.isActive !== undefined) {
    userUpdates.isActive = updateData.isActive;
  }
  userUpdates.updatedAt = new Date();

  const updatedUser = await db.collection("user").findOneAndUpdate(
    { _id: userIdObj },
    { $set: userUpdates },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    throw new AppError(404, "User not found");
  }

  if (updateData.role !== undefined && targetMember) {
    const newMemberRole =
      updateData.role === Roles.ORGANIZATION_OWNER
        ? "owner"
        : updateData.role === Roles.OPERATIONS_MANAGER
          ? "member"
          : "worker";

    await db.collection("member").updateOne(
      { _id: targetMember._id },
      {
        $set: {
          role: newMemberRole,
          customRole: updateData.role,
          updatedAt: new Date(),
        },
      }
    );
  }

  const updatedMember = await db.collection("member").findOne({
    userId: userIdObj,
  });

  return {
    id: updatedUser._id.toString(),
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone || updatedUser.phoneNumber || "",
    role: updatedMember?.customRole || updatedMember?.role,
    organizationId: updatedMember?.organizationId?.toString(),
    isActive: updatedUser.isActive,
  };
};

export const getManagersByOrganization = async (organizationId: string) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const members = await db
    .collection("member")
    .find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      customRole: Roles.OPERATIONS_MANAGER,
    })
    .toArray();

  if (members.length === 0) return [];

  const userIds = members.map((m) => m.userId);

  const users = await db
    .collection("user")
    .find({
      _id: { $in: userIds },
      isDeleted: { $ne: true },
    })
    .toArray();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return members
    .map((member) => {
      const user = userMap.get(member.userId.toString());
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || user.phoneNumber || "",
        role: member.customRole || member.role,
        organizationId: member.organizationId?.toString(),
        isActive: user.isActive ?? true,
      };
    })
    .filter(Boolean);
};

export const toggleActiveUser = async (
  userId: string,
  currentUser: AuthenticatedUser
) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);

  const user = await db.collection("user").findOne({ _id: userIdObj });
  if (!user || user.isDeleted) {
    throw new AppError(404, "User not found");
  }

  const targetMember = await db.collection("member").findOne({
    userId: userIdObj,
  });

  const targetRole = targetMember?.customRole || targetMember?.role;
  const targetOrgId = targetMember?.organizationId;

  if (currentUser.role !== Roles.SUPER_ADMIN) {
    if (currentUser.role !== Roles.ORGANIZATION_OWNER) {
      throw new AppError(403, "Unauthorized");
    }

    if (
      targetOrgId?.toString() !==
      currentUser.organizationId?.toString()
    ) {
      throw new AppError(403, "Unauthorized");
    }

    if (targetRole === Roles.SUPER_ADMIN || targetRole === "SUPER_ADMIN") {
      throw new BadRequestError("Cannot toggle super admin");
    }
  }

  const newActiveState = !user.isActive;

  const updatedUser = await db.collection("user").findOneAndUpdate(
    { _id: userIdObj },
    { $set: { isActive: newActiveState, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    throw new AppError(404, "User not found");
  }

  return {
    id: updatedUser._id.toString(),
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone || updatedUser.phoneNumber || "",
    role: targetRole,
    organizationId: targetOrgId?.toString(),
    isActive: updatedUser.isActive,
  };
};