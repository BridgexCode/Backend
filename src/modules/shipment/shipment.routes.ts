import { Router } from "express";
import {
  createShipmentController,
  getShipmentsController,
  getShipmentByIdController,
} from "./shipment.controller.js";
import { protectRoute, authorizeRoles } from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";

const router = Router();

router.post(
  "/create-shipment",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  createShipmentController,
);

router.get(
  "/get-shipments",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  getShipmentsController,
);

router.get(
  "/shipmentById:id",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  getShipmentByIdController,
);

export default router;
