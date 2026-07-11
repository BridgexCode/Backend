import z from "zod";
import { BadRequestError } from "../../common/errors/app-error.js";

// export const validateCreateDriver = (body: any) => {
//   if (!body) {
//     throw new BadRequestError("Request body is required");
//   }

//   const {
//     name,
//     phone,
//     licenseNumber,
//     status,
//   } = body;

//   if (!name) {
//     throw new BadRequestError("name is required");
//   }

//   if (!phone) {
//     throw new BadRequestError("phone is required");
//   }

//   if (!licenseNumber) {
//     throw new BadRequestError("licenseNumber is required");
//   }

//   const allowedStatuses = ["available", "on_trip", "inactive"];

//   if (status && !allowedStatuses.includes(status)) {
//     throw new BadRequestError(
//       `status must be one of: ${allowedStatuses.join(", ")}`
//     );
//   }
// };

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

export const validateUpdateDriver = (body: any) => {
  if (!body) {
    throw new BadRequestError("Request body is required");
  }

  const { status } = body;
  const allowedStatuses = ["available", "on_trip", "inactive"];

  if (status && !allowedStatuses.includes(status)) {
    throw new BadRequestError(
      `status must be one of: ${allowedStatuses.join(", ")}`
    );
  }
};