import { Router } from "express";
import {
  createUserController,
  softDeleteUserController,
  updateUserController,
  toggleActiveUserController,
} from "./user.controller.js";
import { protectRoute, authorizeRoles } from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";

const router = Router();

router.post(
  "/",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER),
  createUserController,
);

router.patch(
  "/:id/soft-delete",
  protectRoute,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ORGANIZATION_OWNER),
  softDeleteUserController,
);
router.patch(
  "/:id/update-user",
  protectRoute,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ORGANIZATION_OWNER),
  updateUserController,
);

router.patch(
  "/:id/toggle-active",
  protectRoute,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ORGANIZATION_OWNER),
  toggleActiveUserController,
);

export default router;
