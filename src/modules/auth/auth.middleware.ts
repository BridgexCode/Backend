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
    const db = mongoose.connection.db;
    if (!db) {
      res.status(500).json({ error: "Internal Server Error: Database connection not ready." });
      return;
    }

    let session: any = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    }).catch(() => null);

    // Fallback: try Authorization header if cookie session not found
    if (!session) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const sessionDoc = await db.collection("session").findOne({ sessionToken: token })
          || await db.collection("sessions").findOne({ sessionToken: token });
        if (sessionDoc) {
          const userId = sessionDoc.userId?.toString();
          if (userId) {
            const userDoc = await db.collection("user").findOne({
              _id: new mongoose.Types.ObjectId(userId),
            });
            if (userDoc) {
              session = {
                user: {
                  id: userDoc._id.toString(),
                  name: userDoc.name,
                  email: userDoc.email,
                  role: userDoc.role,
                  phoneNumber: userDoc.phoneNumber,
                  createdAt: userDoc.createdAt,
                },
                session: sessionDoc,
              };
            }
          }
        }
      }
    }

    if (!session) {
      res.status(401).json({ error: "Unauthorized: No active session found." });
      return;
    }

    // Always fetch the user document to get the authoritative role
    let userDoc: any = null;
    try {
      userDoc = await db.collection("user").findOne({
        _id: new mongoose.Types.ObjectId(session.user.id),
      });
    } catch {}

    let organizationId: string | undefined = undefined;
    let role: Role;

    if (userDoc?.role === Roles.SUPER_ADMIN) {
      role = Roles.SUPER_ADMIN;
    } else if (session.user.role === Roles.SUPER_ADMIN) {
      role = Roles.SUPER_ADMIN;
    } else {
      const memberRecord = await db
        .collection("member")
        .findOne({
          $or: [
            { userId: session.user.id },
            { userId: new mongoose.Types.ObjectId(session.user.id) },
          ],
        });
      if (!memberRecord) {
        res.status(403).json({ error: "Forbidden: No organization membership found" });
        return;
      }
      organizationId = memberRecord.organizationId.toString();
      if (memberRecord.customRole && Object.values(Roles).includes(memberRecord.customRole)) {
        role = memberRecord.customRole;
      } else {
        role =
          memberRecord.role === "owner"
            ? Roles.ORGANIZATION_OWNER
            : memberRecord.role === "member"
              ? Roles.OPERATIONS_MANAGER
              : Roles.WORKER;
      }
    }

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
