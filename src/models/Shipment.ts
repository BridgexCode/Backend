import mongoose, { Schema } from "mongoose";
import { IShipment } from "../modules/shipment/shipment.types.js";

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