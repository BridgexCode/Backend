

import { Router } from "express";
import {
  createShipmentController,
  getShipmentsController,
  getShipmentByIdController,
  assignOperationsManagerController,
  updateShipmentStatusController,
  getShipmentsTimelineController,
} from "./shipment.controller.js";

import {
  protectRoute,
  authorizeRoles,
} from "../auth/auth.middleware.js";

import { Roles } from "../../common/constants/roles.js";

const router = Router();

// Create Shipment
router.post(
  "/create-shipment",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  createShipmentController,
);

// Get All Shipments
router.get(
  "/get-shipments",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  getShipmentsController,
);

// Shipment Timeline
router.get(
  "/timeline",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  getShipmentsTimelineController,
);

// Get Shipment By ID
router.get(
  "/shipmentById/:id",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  getShipmentByIdController,
);

// Assign Operations Manager
router.put(
  "/:id/assign-manager",
  protectRoute,
  authorizeRoles(
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  assignOperationsManagerController,
);

// Update Shipment Status
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