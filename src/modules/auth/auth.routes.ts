import { Router } from "express";
import { registerOrganization, login, logout, getMe } from "./auth.controller.js";
import { protectRoute } from "./auth.middleware.js";

const router = Router();

// Public Routes
router.post("/register-organization", registerOrganization);
router.post("/login", login);
router.post("/logout", logout);

// Protected Routes
router.get("/me", protectRoute, getMe);

export default router;

