import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { getAuth } from "../../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { AuthRequest } from "./auth.types.js";
import { Roles, Role } from "../../common/constants/roles.js";

//  Middleware to protect secure routes.
export const protectRoute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = await getAuth();

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: "Unauthorized: No active session found." });
      return;
    }

    const db = mongoose.connection.db;
    if (!db) {
      res.status(500).json({
        error: "Internal Server Error: Database connection not ready.",
      });
      return;
    }

    let organizationId: string | undefined = undefined;
    let role: Role = (session.user.role as Role) || Roles.OPERATIONS_MANAGER;

    if (session.user.role !== Roles.SUPER_ADMIN) {
      const memberRecord = await db
        .collection("member")
        .findOne({
          $or: [
            { userId: session.user.id },
            { userId: new mongoose.Types.ObjectId(session.user.id) },
          ],
        });
      if (memberRecord) {
        organizationId = memberRecord.organizationId.toString();
        role =
          memberRecord.role === "owner"
            ? Roles.ORGANIZATION_OWNER
            : Roles.OPERATIONS_MANAGER;
      }
    } else {
      role = Roles.SUPER_ADMIN;
    }

    // Attach user and session to the request object
    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role,
      organizationId,
      phoneNumber: session.user.phoneNumber,
      createdAt: session.user.createdAt,
    };
    req.session = session.session;

    next();
  } catch (error) {
    next(error);
  }
};

// Use only after protect middleware !!!
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: You do not have permission" });
    }

    next();
  };
};
