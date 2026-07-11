import { Document } from "mongoose";
import { Role } from "../../common/constants/roles.js";

export interface CreateUserInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: Role;
}

export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  phoneNumber?: string;
  image?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}