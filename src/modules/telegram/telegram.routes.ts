import { Router } from "express";
import { webhookHandler, sendNotification } from "./telegram.controller.js";
import { protectRoute, authorizeRoles } from "../auth/auth.middleware.js";
import { Roles } from "../../common/constants/roles.js";

const router = Router();

router.post("/webhook", webhookHandler);

router.post(
  "/send-notification",
  protectRoute,
  authorizeRoles(Roles.ORGANIZATION_OWNER, Roles.OPERATIONS_MANAGER),
  sendNotification,
);

export default router;
