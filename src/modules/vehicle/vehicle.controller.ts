import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.types.js";
import { validateCreateVehicle } from "./vehicle.validation.js";
import * as VehicleService from "./vehicle.service.js";

export const createVehicleController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateCreateVehicle(req.body);

    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const vehicle = await VehicleService.createVehicle(
      req.body,
      req.user.organizationId,
    );

    res.status(201).json({
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVehiclesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const vehicles = await VehicleService.getAllVehicles(
      req.user.organizationId,
    );

    res.status(200).json({
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleByIdController = async (
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
      res.status(400).json({ error: "Vehicle ID is required" });
      return;
    }

    const vehicle = await VehicleService.getVehicleById(
      id,
      req.user.organizationId,
    );

    res.status(200).json({
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicleController = async (
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
      res.status(400).json({ error: "Vehicle ID is required" });
      return;
    }

    const vehicle = await VehicleService.updateVehicle(
      id,
      req.body,
      req.user.organizationId,
    );

    res.status(200).json({
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicleController = async (
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
      res.status(400).json({ error: "Vehicle ID is required" });
      return;
    }

    await VehicleService.deleteVehicle(
      id,
      req.user.organizationId,
    );

    res.status(200).json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};