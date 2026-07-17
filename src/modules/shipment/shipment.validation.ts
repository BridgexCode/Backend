import { BadRequestError } from "../../common/errors/app-error.js";

export const validateCreateShipment = (body: any) => {
  if (!body) {
    throw new BadRequestError("Request body is required");
  }

  const { pickupLocation, destination, customerName, expectedDeliveryDate } =
    body;

  if (!pickupLocation) {
    throw new BadRequestError("pickupLocation is required");
  }

  if (!destination) {
    throw new BadRequestError("destination is required");
  }

  if (!customerName) {
    throw new BadRequestError("customerName is required");
  }

  if (!expectedDeliveryDate) {
    throw new BadRequestError("expectedDeliveryDate is required");
  }

  const parsed = new Date(expectedDeliveryDate);
  if (isNaN(parsed.getTime())) {
    throw new BadRequestError("expectedDeliveryDate must be a valid date");
  }
};

export const validateAssignOperationsManager = (body: any) => {
  const { operationsManagerId } = body;

  if (!operationsManagerId) {
    throw new BadRequestError("operationsManagerId is required");
  }
};

export const validateAssignDriver = (body: any) => {
  const { driverId } = body;

  if (!driverId) {
    throw new BadRequestError("driverId is required");
  }
};

export const validateUpdateShipment = (body: any) => {
  if (!body || Object.keys(body).length === 0) {
    throw new BadRequestError("At least one field is required to update");
  }

  if (body.expectedDeliveryDate) {
    const parsed = new Date(body.expectedDeliveryDate);
    if (isNaN(parsed.getTime())) {
      throw new BadRequestError("expectedDeliveryDate must be a valid date");
    }
  }
};

export const validateUpdateShipmentStatus = (body: any) => {
  const { status } = body;

  if (!status) {
    throw new BadRequestError("status is required");
  }

  const VALID_STATUSES = [
    "created",
    "assigned",
    "picked_up",
    "in_transit",
    "delivered",
    "cancelled",
    "delayed",
  ];

  if (!VALID_STATUSES.includes(status)) {
    throw new BadRequestError("Invalid shipment status");
  }
};

