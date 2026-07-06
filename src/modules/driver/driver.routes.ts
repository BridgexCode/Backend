import { Router } from "express";
import {
  createDriverController,
  getDriversController,
  getDriverByIdController,
  updateDriverController,
  deleteDriverController,
} from "./driver.controller.js";
import { protectRoute, authorizeRoles } from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";

const router = Router();

// Create Driver
router.post(
  "/create-driver",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  createDriverController,
);

// Get All Drivers
router.get(
  "/get-drivers",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  getDriversController,
);

// Get Driver By ID
router.get(
  "/get-driverById/:id",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  getDriverByIdController,
);

// Update Driver
router.put(
  "/update-driver/:id",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  updateDriverController,
);

// Delete Driver
router.delete(
  "/delete-driver/:id",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  deleteDriverController,
);

export default router;