import { boolean } from "better-auth";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  companyId: mongoose.Types.ObjectId;

  userName: string;
  email: string;
  password: string;
  phone?: string;

  role:
    | "super_admin"
    | "organization_owner"
    | "operations_manager";

  profileImage?: string;

  isActive: boolean;

  isDeleted: boolean;

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
        "super_admin",
        "organization_owner",
        "operations_manager",
      ],
      default: "operations_manager",
    },

    profileImage: {
      type: String,
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
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;