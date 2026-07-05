import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDriver extends Document {
  orgId: Types.ObjectId;

  name: string;
  phone: string;
  licenseNumber: string;
  vehicleNumber: string;

  status: "available" | "on_trip" | "inactive";

  createdAt: Date;
  updatedAt: Date;
}

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
      required: true,
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