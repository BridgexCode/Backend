import { BadRequestError } from "../../common/errors/app-error.js";

export const validateCreateVehicle = (body: any) => {
  if (!body) {
    throw new BadRequestError("Request body is required");
  }

  const { vehicleNumber, vehicleModel, type } = body;

  if (!vehicleNumber) {
    throw new BadRequestError("vehicleNumber is required");
  }

  if (!vehicleModel) {
    throw new BadRequestError("vehicleModel is required");
  }

  if (!type) {
    throw new BadRequestError("type is required");
  }

  const VALID_TYPES = [
    "truck",
    "van",
    "pickup",
    "other",
  ];

  if (!VALID_TYPES.includes(type)) {
    throw new BadRequestError("Invalid vehicle type");
  }
};

export const validateAssignDriver = (body: any) => {
  const { driverId } = body;

  if (!driverId) {
    throw new BadRequestError("driverId is required");
  }
};

export const validateUpdateVehicleStatus = (body: any) => {
  const { status } = body;

  if (!status) {
    throw new BadRequestError("status is required");
  }

  const VALID_STATUSES = [
    "available",
    "assigned",
    "maintenance",
    "inactive",
  ];

  if (!VALID_STATUSES.includes(status)) {
    throw new BadRequestError("Invalid vehicle status");
  }
};