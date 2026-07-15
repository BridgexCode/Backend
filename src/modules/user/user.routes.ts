import { Router } from "express";
import {
  createUserController,
  softDeleteUserController,
  updateUserController,
  toggleActiveUserController,
  getManagersController,
} from "./user.controller.js";
import { protectRoute, authorizeRoles } from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";

const router = Router();

router.get(
  "/",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  getManagersController,
);

router.post(
  "/",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  createUserController,
);

router.patch(
  "/:id/soft-delete",
  protectRoute,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  softDeleteUserController,
);
router.patch(
  "/:id/update-user",
  protectRoute,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  updateUserController,
);

router.patch(
  "/:id/toggle-active",
  protectRoute,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  toggleActiveUserController,
);

export default router;
