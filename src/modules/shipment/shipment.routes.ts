import { Router } from "express";
import {
  createShipmentController,
  getShipmentsController,
  getShipmentByIdController,
  assignOperationsManagerController,
  updateShipmentStatusController,
  getShipmentsTimelineController,
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
  "/timeline",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  getShipmentsTimelineController,
);

router.get(
  "/shipmentById/:id",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  getShipmentByIdController,
);

router.put(
  "/:id/assign-manager",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  assignOperationsManagerController,
);

router.patch(
  "/:id/status",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER,
    Roles.WORKER
  ),
  updateShipmentStatusController,
);

export default router;