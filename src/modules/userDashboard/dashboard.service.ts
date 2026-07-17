import mongoose from "mongoose";
import Driver from "../../models/Driver.js";
import Shipment from "../../models/Shipment.js";
import Vehicle from "../../models/Vehicle.js";

export const getDashboardStats = async (
  organizationId: string,
) => {
  const orgObjectId = new mongoose.Types.ObjectId(organizationId);

  const [
    totalShipments,
    deliveredShipments,
    inTransitShipments,
    delayedShipments,
    totalDrivers,
    activeDrivers,
    totalVehicles,
    activeVehicles,
  ] = await Promise.all([
    Shipment.countDocuments({ orgId: orgObjectId }),

    Shipment.countDocuments({
      orgId: orgObjectId,
      statusLifecycle: "delivered",
    }),

    Shipment.countDocuments({
      orgId: orgObjectId,
      statusLifecycle: "in_transit",
    }),

    Shipment.countDocuments({
      orgId: orgObjectId,
      statusLifecycle: { $in: ["assigned", "picked_up", "in_transit"] },
    }),

    Driver.countDocuments({ orgId: orgObjectId }),

    Driver.countDocuments({
      orgId: orgObjectId,
      status: { $in: ["available", "on_trip"] },
    }),

    Vehicle.countDocuments({ orgId: orgObjectId }),

    Vehicle.countDocuments({
      orgId: orgObjectId,
      status: { $in: ["available", "assigned"] },
    }),
  ]);

  return {
    totalShipments,
    deliveredShipments,
    inTransitShipments,
    delayedShipments,
    totalDrivers,
    activeDrivers,
    totalVehicles,
    activeVehicles,
  };
};