import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.types.js";
import * as AuthService from "./auth.service.js";
import {
  validateRegisterOrganization,
  validateLogin,
  validateResendVerificationEmail,
} from "./auth.validation.js";
import { getAuth } from "../../lib/auth.js";
import { toNodeHandler } from "better-auth/node";

export const betterAuthHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = await getAuth();
    return toNodeHandler(auth.handler)(req, res);
  } catch (error) {
    next(error);
  }
};

export const registerOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegisterOrganization(req.body);
    const result = await AuthService.registerOrganization(req.body);

    res.status(201).json({
      message: "Organization registered successfully. Please verify your email.",
      email: result.user.email,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateLogin(req.body);
    const result = await AuthService.login(req.body);

    if (result.setCookie) {
      res.setHeader("set-cookie", result.setCookie);
    }

    res.status(200).json({
      message: "Login successfull",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AuthService.logout(req.headers);

    if (result.setCookie) {
      res.setHeader("set-cookie", result.setCookie);
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateResendVerificationEmail(req.body);
    await AuthService.resendVerificationEmail(req.body);

    res.status(200).json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};

export const getSocialSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AuthService.getSocialSession(req.headers);

    res.status(200).json({
      message: "Social login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      phoneNumber: user.phoneNumber || "",
      createdAt: user.createdAt,
    },
  });
};
