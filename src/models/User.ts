import { boolean } from "better-auth";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  organizationId: mongoose.Types.ObjectId;

  userName: string;
  email: string;
  password: string;
  phone?: string;

  role:
    | "SUPER_ADMIN"
    | "ORG_ADMIN"
    | "OPERATIONS_MANAGER"
    | "DRIVER";

  status:
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED";

  createdBy?: mongoose.Types.ObjectId;

  profileImage?: string;

  isActive: boolean;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "ORG_ADMIN",
        "OPERATIONS_MANAGER",
        "DRIVER",
      ],
      default: "DRIVER",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED",
      ],
      default: "ACTIVE",
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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


userSchema.index(
  {
    companyId: 1,
    email: 1,
  },
  {
    unique: true,
  }
);

// Unique phone per company
userSchema.index(
  {
    companyId: 1,
    phone: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $exists: true },
    },
  }
);

// Query optimization indexes
userSchema.index({
  companyId: 1,
});

userSchema.index({
  role: 1,
});

userSchema.index({
  status: 1,
});

const User = mongoose.model<IUser>(
  "User",
  userSchema
);

export default User;