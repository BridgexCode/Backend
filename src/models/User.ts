import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  companyId: mongoose.Types.ObjectId;

  userName: string;
  email: string;
  password: string;
  phone?: string;

  role: "SUPER_ADMIN" | "ORGANIZATION_OWNER" | "OPERATIONS_MANAGER";

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
      enum: ["SUPER_ADMIN", "ORGANIZATION_OWNER", "OPERATIONS_MANAGER", "WORKER"],
      default: "OPERATIONS_MANAGER",
    },

    profileImage: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
