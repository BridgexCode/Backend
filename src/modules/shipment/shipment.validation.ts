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
