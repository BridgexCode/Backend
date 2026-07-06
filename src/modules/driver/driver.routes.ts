import { Router } from "express";
import { createDriverController, getAllDriversController } from "./driver.controller.js";
import { protectRoute, authorizeRoles } from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";

const router = Router();

router.get(
  "/get-drivers",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  getAllDriversController,
);

router.post(
  "/create-driver",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  createDriverController,
);

export default router;
