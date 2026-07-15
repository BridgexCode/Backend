import { Router } from "express";
import {
  getDashboardController,
  getOrganizationsController,
  getOrganizationByIdController,
  updateOrganizationStatusController,
  deleteOrganizationController,
} from "./superAdmin.controller.js";
import { protectRoute, authorizeRoles } from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";

const router = Router();

router.use(protectRoute);
router.use(authorizeRoles(Roles.SUPER_ADMIN));

// Dashboard
router.get(
  "/dashboard",
  getDashboardController,
);

// Organizations
router.get(
  "/organizations",
  getOrganizationsController,
);

router.get(
  "/organizations/:id",
  getOrganizationByIdController,
);

router.patch(
  "/organizations/:id/status",
  updateOrganizationStatusController,
);

router.delete(
  "/organizations/:id",
  deleteOrganizationController,
);

export default router;