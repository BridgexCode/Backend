import { Document, Types } from "mongoose";
import { validateCreateDriver } from "./driver.validation.js";
import z from "zod";

export type DriverStatus =
  | "available"
  | "on_trip"
  | "inactive";

export interface IDriver extends Document {
  driverId?: string;
  orgId: Types.ObjectId;

  name: string;
  phone: string;
  licenseNumber: string;
  vehicleNumber?: string;
  telegramId?: string;
  status: DriverStatus;

  createdAt: Date;
  updatedAt: Date;
}

export type CreateDriverInput = z.infer<
  typeof validateCreateDriver
>;

export interface DriverResponse {
  _id: string;
  driverId?: string;
  orgId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleNumber: string;
  telegramId?: string;
  status: DriverStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverQuery {
  page?: string;
  limit?: string;
  status?: DriverStatus;
  search?: string;
}

export interface UpdateDriverInput {
  name?: string;
  phone?: string;
  licenseNumber?: string;
  vehicleNumber?: string;
  telegramId?: string;
  status?: DriverStatus;
}