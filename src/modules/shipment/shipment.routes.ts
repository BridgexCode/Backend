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
<<<<<<< HEAD
  "/timeline",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  getShipmentsTimelineController,
);

router.get(
  "/:id",
=======
  "/shipmentById:id",
>>>>>>> a19e50ee0ef048c7bc0c3ca61bbf96400984b003
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
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER, Roles.WORKER),
  updateShipmentStatusController,
);

export default router;
