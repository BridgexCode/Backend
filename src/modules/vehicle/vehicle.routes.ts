import { Router } from "express";
import {
  createVehicleController,
  getAllVehiclesController,
  getVehicleByIdController,
  updateVehicleController,
  deleteVehicleController,
} from "./vehicle.controller.js";
import { protectRoute, authorizeRoles } from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";

const router = Router();

router.post(
  "/create-vehicle",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  createVehicleController,
);

router.get(
  "/get-vehicles",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  getAllVehiclesController,
);

router.get(
  "/vehicleById/:id",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  getVehicleByIdController,
);

router.put(
  "/update-vehicle/:id",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  updateVehicleController,
);

router.delete(
  "/delete-vehicle/:id",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  deleteVehicleController,
);

export default router;