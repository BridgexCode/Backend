import { Document, Types } from "mongoose";

export type ShipmentStatus =
  | "created"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "delayed";

export interface ShipmentTimelineEvent {
  status: ShipmentStatus;
  description: string;
  updatedBy?: string;
  timestamp: Date;
}

export interface CreateShipmentInput {
  pickupLocation: string;
  destination: string;
  customerName: string;
  assignedDriverId?: string;
  assignedVehicleId?: string;
  expectedDeliveryDate: string;
  notes?: string;
}

export interface AssignOperationsManagerInput {
  operationsManagerId: string;
}

export interface AssignDriverInput {
  driverId: string;
  vehicleId?: string;
}

export interface UpdateShipmentInput {
  pickupLocation?: string;
  destination?: string;
  customerName?: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

export interface UpdateShipmentStatusInput {
  status: ShipmentStatus;
}

export interface ShipmentResponse {
  _id: string;
  shipmentId: string;
  orgId: string;
  pickupLocation: string;
  destination: string;
  customerName: string;
  assignedDriverId?: string;
  assignedVehicleId?: string;
  assignedOperationsManagerId?: string;
  expectedDeliveryDate: Date;
  statusLifecycle: ShipmentStatus;
  timeline?: ShipmentTimelineEvent[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentQuery {
  page?: string;
  limit?: string;
  status?: ShipmentStatus;
}

export interface IShipment extends Document {
  shipmentId: string;
  orgId: Types.ObjectId;

  pickupLocation: string;
  destination: string;

  customerName: string;

  assignedDriverId?: Types.ObjectId;
  assignedVehicleId?: Types.ObjectId;

  expectedDeliveryDate: Date;

  statusLifecycle:ShipmentStatus;

  createdAt: Date;
  updatedAt: Date;
}