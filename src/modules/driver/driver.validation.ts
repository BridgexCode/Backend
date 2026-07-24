import z from "zod";
import { BadRequestError } from "../../common/errors/app-error.js";

export const validateCreateDriver = z.object({
  name:z.string().min(1,"name is required"),
  phone:z.string().min(7,"phone number is required"),
  licenseNumber:z.string().min(1,"licenseNumber is required"),
  vehicleNumber:z.string().optional(),
  status:z.enum([
    "available",
    "on_trip",
    "inactive",
  ]).optional()
})

export const validateUpdateDriver = z.object({
  status: z.
    enum(['available', 'on_trip', 'inactive'])
    .optional()
})