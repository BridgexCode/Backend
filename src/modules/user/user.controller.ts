import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.types.js";
import { validateCreateUser } from "./user.validation.js";
import * as UserService from "./user.service.js";

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    validateCreateUser(req.body);

    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const user = await UserService.createUser(
      req.body,
      req.user.organizationId,
      req.user.id
    );

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};