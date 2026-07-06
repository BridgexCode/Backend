import { Router } from "express";
import { protectRoute } from "../auth/auth.middleware.js";
import { getDashboardStatsController } from "./dashboard.controller.js";

const router = Router();

router.get("/stats", protectRoute, getDashboardStatsController);

export default router;