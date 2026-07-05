import { Types } from "mongoose";

export type VehicleType =
  | "truck"
  | "van"
  | "pickup"
  | "bike"
  | "other";

export type VehicleStatus =
  | "available"
  | "assigned"
  | "maintenance"
  | "inactive";

export interface CreateVehicleInput {
  vehicleNumber: string;
  vehicleModel: string;
  type: VehicleType;
  driverId?: string;
}

export interface UpdateVehicleInput {
  vehicleNumber?: string;
  vehicleModel?: string;
  type?: VehicleType;
  driverId?: string;
  status?: VehicleStatus;
}

export interface VehicleResponse {
  _id: Types.ObjectId;
  vehicleNumber: string;
  vehicleModel: string;
  type: VehicleType;
  driverId?: Types.ObjectId;
  status: VehicleStatus;
  orgId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}