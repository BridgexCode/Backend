import { Router } from "express";
import { betterAuthHandler } from "./auth.controller";
import { protectRoute } from "./auth.middleware";

const router = Router();

router.get("/me", protectRoute, (req, res) => {
  res.json({
    message: "You are successfully authenticated!",
    user: (req as any).user,
    session: (req as any).session
  });
});

export default router;
