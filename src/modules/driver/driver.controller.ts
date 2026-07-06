import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.types.js";
import { validateCreateDriver, validateUpdateDriver } from "./driver.validation.js";
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

export const getDriversController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const query = {
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
      status: req.query.status as any,
      search: req.query.search as string | undefined,
    };

    const result = await DriverService.getDrivers(
      req.user.organizationId,
      query,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDriverByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: "Driver ID is required" });
      return;
    }

    const driver = await DriverService.getDriverById(
      id,
      req.user.organizationId,
    );

    res.status(200).json({ data: driver });
  } catch (error) {
    next(error);
  }
};

export const updateDriverController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateUpdateDriver(req.body);

    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: "Driver ID is required" });
      return;
    }

    const driver = await DriverService.updateDriver(
      id,
      req.body,
      req.user.organizationId,
    );

    res.status(200).json({
      message: "Driver updated successfully",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDriverController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: "Driver ID is required" });
      return;
    }

    await DriverService.deleteDriver(
      id,
      req.user.organizationId,
    );

    res.status(200).json({
      message: "Driver deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};