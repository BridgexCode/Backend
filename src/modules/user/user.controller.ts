import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.types.js";
import { validateCreateUser } from "./user.validation.js";
import * as UserService from "./user.service.js";

export const createUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
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
      req.user.id,
    );

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const softDeleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  const deletedUser = await UserService.softDeleteUser(id as string);

  res.status(200).json({
    success: true,
    message: "user deleted successfully",
    data: deletedUser,
  });
};

export const updateUserController = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const updatedUser = await UserService.updateUser(id as string, req.body, req.user!);

  res.json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
};
