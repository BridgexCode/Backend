

import { Router } from "express";
import {
  createShipmentController,
  getShipmentsController,
  getShipmentByIdController,
  assignOperationsManagerController,
  assignDriverController,
  updateShipmentController,
  updateShipmentStatusController,
  deleteShipmentController,
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
    Roles.SUPER_ADMIN,
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
    Roles.SUPER_ADMIN,
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
    Roles.SUPER_ADMIN,
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
    Roles.SUPER_ADMIN,
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
    Roles.SUPER_ADMIN,
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  assignOperationsManagerController,
);

// Assign Driver
router.put(
  "/:id/assign-driver",
  protectRoute,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  assignDriverController,
);

// Update Shipment
router.put(
  "/:id",
  protectRoute,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  updateShipmentController,
);

// Delete Shipment
router.delete(
  "/:id",
  protectRoute,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER
  ),
  deleteShipmentController,
);

// Update Shipment Status
router.patch(
  "/:id/status",
  protectRoute,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.ORGANIZATION_OWNER,
    Roles.OPERATIONS_MANAGER,
    Roles.WORKER
  ),
  updateShipmentStatusController,
);

export default router; 