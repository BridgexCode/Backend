export type DriverStatus =
  | "available"
  | "on_trip"
  | "inactive";

export interface CreateDriverInput {
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleNumber: string;
  status?: DriverStatus;
}

export interface DriverResponse {
  _id: string;
  orgId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleNumber: string;
  status: DriverStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverQuery {
  page?: string;
  limit?: string;
  status?: DriverStatus;
}