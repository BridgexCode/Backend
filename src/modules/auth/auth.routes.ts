import { Router } from "express";
import {
  registerOrganization,
  login,
  logout,
  getMe,
  getSocialSession,
  resendVerificationEmail,
} from "./auth.controller.js";
import { protectRoute } from "./auth.middleware.js";

const router = Router();

// Public Routes
router.post("/register-organization", registerOrganization);
router.post("/login", login);
router.post("/logout", logout);
router.post("/social-session", getSocialSession);
router.post("/resend-verification-email", resendVerificationEmail);

// Protected Routes
router.get("/me", protectRoute, getMe);

export default router;

