import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.types.js";
import { validateCreateDriver } from "./driver.validation.js";
import * as DriverService from "./driver.service.js";

export const createDriverController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateCreateDriver(req.body);

    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const driver = await DriverService.createDriver(
      req.body,
      req.user.organizationId,
    );

    res.status(201).json({
      message: "Driver created successfully",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};