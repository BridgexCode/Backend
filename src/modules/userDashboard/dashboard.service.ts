import Driver from "../../models/Driver.js";
import Shipment from "../../models/Shipment.js";
import Vehicle from "../../models/Vehicle.js";


export const getDashboardStats = async (
  organizationId: string,
) => {
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
    Shipment.countDocuments({ organizationId }),

    Shipment.countDocuments({
      organizationId,
      status: "DELIVERED",
    }),

    Shipment.countDocuments({
      organizationId,
      status: "IN_TRANSIT",
    }),

    Shipment.countDocuments({
      organizationId,
      status: "DELAYED",
    }),

    Driver.countDocuments({ organizationId }),

    Driver.countDocuments({
      organizationId,
      isActive: true,
    }),

    Vehicle.countDocuments({ organizationId }),

    Vehicle.countDocuments({
      organizationId,
      isActive: true,
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