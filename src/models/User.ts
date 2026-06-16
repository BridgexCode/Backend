import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  companyId: mongoose.Types.ObjectId;

  userName: string;
  email: string;
  password: string;
  phone?: string;

  role: "SUPER_ADMIN" | "ORGANIZATION_OWNER" | "OPERATIONS_MANAGER" | "WORKER";

  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdBy?: mongoose.Types.ObjectId;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "ORGANIZATION_OWNER",
        "OPERATIONS_MANAGER",
        "WORKER",
      ],
      default: "OPERATIONS_MANAGER",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      index: true,
    },

    profileImage: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
