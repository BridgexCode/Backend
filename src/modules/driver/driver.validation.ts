import { BadRequestError } from "../../common/errors/app-error.js";

export const validateCreateDriver = (body: any) => {
  if (!body) {
    throw new BadRequestError("Request body is required");
  }

  const {
    name,
    phone,
    licenseNumber,
    status,
  } = body;

  if (!name) {
    throw new BadRequestError("name is required");
  }

  if (!phone) {
    throw new BadRequestError("phone is required");
  }

  if (!licenseNumber) {
    throw new BadRequestError("licenseNumber is required");
  }

  const allowedStatuses = ["available", "on_trip", "inactive"];

  if (status && !allowedStatuses.includes(status)) {
    throw new BadRequestError(
      `status must be one of: ${allowedStatuses.join(", ")}`
    );
  }
};