import mongoose, { Document, Schema, Types } from "mongoose";

export interface IShipment extends Document {
  shipmentNumber: string;

  customer: Types.ObjectId;

  pickupLocation: string;
  deliveryLocation: string;

  pickupDate?: Date;
  expectedDeliveryDate?: Date;
  deliveredDate?: Date;

  driver?: Types.ObjectId;

  vehicleNumber?: string;

  status:
    | "pending"
    | "assigned"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

  cargoDescription?: string;
  weight?: number;

  remarks?: string;

  isActive: boolean;
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
  {
    shipmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pickupLocation: {
      type: String,
      required: true,
    },

    deliveryLocation: {
      type: String,
      required: true,
    },

    pickupDate: {
      type: Date,
    },

    expectedDeliveryDate: {
      type: Date,
    },

    deliveredDate: {
      type: Date,
    },

    driver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    vehicleNumber: {
      type: String,
      trim: true,
    },

    cargoDescription: {
      type: String,
    },

    weight: {
      type: Number,
    },

    remarks: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "shipment",
  }
);

shipmentSchema.index({ shipmentNumber: 1 }, { unique: true });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ customer: 1 });

const Shipment = mongoose.model<IShipment>(
  "Shipment",
  shipmentSchema
);

export default Shipment;