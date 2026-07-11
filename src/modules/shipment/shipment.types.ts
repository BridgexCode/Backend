import { Document, Types } from "mongoose";

export type ShipmentStatus =
  | "created"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

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
  expectedDeliveryDate: string;
}

export interface AssignOperationsManagerInput {
  operationsManagerId: string;
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
  assignedOperationsManagerId?: string;
  expectedDeliveryDate: Date;
  statusLifecycle: ShipmentStatus;
  timeline?: ShipmentTimelineEvent[];
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

  expectedDeliveryDate: Date;

  statusLifecycle:ShipmentStatus;

  createdAt: Date;
  updatedAt: Date;
}