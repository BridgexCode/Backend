import mongoose, { Document, Schema, Types } from "mongoose";

export interface IShipment extends Document {
  shipmentId: string;
  orgId: Types.ObjectId;

  pickupLocation: string;
  destination: string;

  customerName: string;

  assignedDriverId?: Types.ObjectId;

  expectedDeliveryDate: Date;

  statusLifecycle:
    | "created"
    | "assigned"
    | "picked_up"
    | "in_transit"
    | "delivered"
    | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    orgId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    assignedDriverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    expectedDeliveryDate: {
      type: Date,
      required: true,
    },

    statusLifecycle: {
      type: String,
      enum: [
        "created",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      default: "created",
    },
  },
  {
    timestamps: true,
    collection: "shipment",
  }
);

shipmentSchema.index({ orgId: 1 });
shipmentSchema.index({ assignedDriverId: 1 });
shipmentSchema.index({ statusLifecycle: 1 });

const Shipment = mongoose.model<IShipment>(
  "Shipment",
  shipmentSchema
);

export default Shipment;