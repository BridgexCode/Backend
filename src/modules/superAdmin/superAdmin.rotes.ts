import { Router } from "express";
import {
  getDashboardController,
  getOrganizationsController,
  getOrganizationByIdController,
  updateOrganizationStatusController,
  deleteOrganizationController,
} from "./superAdmin.controller.js";

const router = Router();

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