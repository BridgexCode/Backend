import { Request } from "express";
import { Role } from "../../common/constants/roles.js";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string;
  phoneNumber?: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  session?: any;
}
