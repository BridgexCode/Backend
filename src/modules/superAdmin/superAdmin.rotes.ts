import { Router } from "express";
import { protectRoute, authorizeRoles } from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";
import {
  getDashboardController,
  getOrganizationsController,
  getOrganizationByIdController,
  updateOrganizationStatusController,
  deleteOrganizationController,
  getMonthlyShipmentsController,
  getPlanDistributionController,
  getOrganizationGrowthController,
  getAuditLogsController,
  getSettingsController,
  updateSettingsController,
} from "./superAdmin.controller.js";

const router = Router();

router.use(protectRoute, authorizeRoles(Roles.SUPER_ADMIN));

router.get("/dashboard", getDashboardController);

router.get("/organizations", getOrganizationsController);
router.get("/organizations/:id", getOrganizationByIdController);
router.patch("/organizations/:id/status", updateOrganizationStatusController);
router.delete("/organizations/:id", deleteOrganizationController);

router.get("/reports/monthly-shipments", getMonthlyShipmentsController);
router.get("/reports/plan-distribution", getPlanDistributionController);
router.get("/reports/organization-growth", getOrganizationGrowthController);

router.get("/audit-logs", getAuditLogsController);

router.get("/settings", getSettingsController);
router.put("/settings", updateSettingsController);

export default router;
