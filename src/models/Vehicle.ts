import mongoose, { Schema } from "mongoose";
import { IVehicle } from "../modules/vehicle/vehicle.types.js";

const vehicleSchema = new Schema<IVehicle>(
  {
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    orgId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["truck", "van", "pickup", "other"],
      required: true,
    },

    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },

    status: {
      type: String,
      enum: ["available", "assigned", "maintenance", "inactive"],
      default: "available",
    },
  },
  {
    timestamps: true,
    collection: "vehicle",
  }
);

vehicleSchema.index(
  { orgId: 1, vehicleNumber: 1 },
  { unique: true }
);

vehicleSchema.index({ orgId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index(
  { driverId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      driverId: { $exists: true },
    },
  }
);

const Vehicle = mongoose.model<IVehicle>(
  "Vehicle",
  vehicleSchema
);

export default Vehicle;