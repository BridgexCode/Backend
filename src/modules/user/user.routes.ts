import { Router } from "express";
import { createUser } from "./user.controller.js";
import {
  protectRoute,
  authorizeRoles,
} from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";

const router = Router();

router.post(
  "/",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER),
  createUser
);
import { softDeleteUserController, updateUserController } from "./user.controller.js";

const router = Router()

router.patch('/:id/soft-delete',softDeleteUserController)
router.patch('/:id/update-user',updateUserController)

export default router;