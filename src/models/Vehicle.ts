import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVehicle extends Document {
  vehicleNumber: string;
  orgId: Types.ObjectId;

  vehicleModel: string;

  type: "truck" | "van" | "pickup" | "other";

  driverId?: Types.ObjectId;

  status: "available" | "assigned" | "maintenance" | "inactive";

  createdAt: Date;
  updatedAt: Date;
}

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
vehicleSchema.index({ driverId: 1 });
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