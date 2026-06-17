import { Router } from "express";
import {
  createUserController,
  softDeleteUserController,
  updateUserController,
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

router.patch("/:id/soft-delete", softDeleteUserController);
router.patch("/:id/update-user", updateUserController);

export default router;
