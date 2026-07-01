import { Types } from "mongoose";

export interface CreateShipmentInput {
  pickupLocation: string;
  destination: string;
  customerName: string;
  assignedDriverId?: string;
  expectedDeliveryDate: string;
}

export interface ShipmentResponse {
  _id: string;
  shipmentId: string;
  orgId: string;
  pickupLocation: string;
  destination: string;
  customerName: string;
  assignedDriverId?: string;
  expectedDeliveryDate: Date;
  statusLifecycle: ShipmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ShipmentStatus =
  | "created"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface ShipmentQuery {
  page?: string;
  limit?: string;
  status?: ShipmentStatus;
}
