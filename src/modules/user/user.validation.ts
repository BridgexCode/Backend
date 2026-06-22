import { BadRequestError } from "../../common/errors/app-error.js";
import { Roles } from "../../common/constants/roles.js";

export const validateCreateUser = (body: any) => {
  const { name, email, phone, password, role } = body;

  if (!name || !role) {
    throw new BadRequestError("Name and role are required");
  }

  const allowedRoles = [Roles.OPERATIONS_MANAGER, Roles.WORKER];

  if (!allowedRoles.includes(role)) {
    throw new BadRequestError(
      "Only OPERATIONS_MANAGER and WORKER can be created"
    );
  }

  if (role === Roles.OPERATIONS_MANAGER) {
    if (!email || !password) {
      throw new BadRequestError(
        "Email and password are required for Operations Manager"
      );
    }
  }

  if (role === Roles.WORKER) {
    if (!phone) {
      throw new BadRequestError("Phone number is required for Worker");
    }
  }
};