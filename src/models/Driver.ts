import mongoose, { Schema } from "mongoose";
import { IDriver } from "../modules/driver/driver.types.js";

const driverSchema = new Schema<IDriver>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleNumber: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["available", "on_trip", "inactive"],
      default: "available",
    },
  },
  {
    timestamps: true,
    collection: "driver",
  }
);

driverSchema.index({ orgId: 1 });
driverSchema.index({ phone: 1 });

const Driver = mongoose.model<IDriver>("Driver", driverSchema);

export default Driver;