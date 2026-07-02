import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.types.js";
import { validateCreateShipment } from "./shipment.validation.js";
import * as ShipmentService from "./shipment.service.js";

export const createShipmentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateCreateShipment(req.body);

    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const shipment = await ShipmentService.createShipment(
      req.body,
      req.user.organizationId,
    );

    res.status(201).json({
      message: "Shipment created successfully",
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const getShipmentsController = async (
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
      status: req.query.status as string | undefined,
    };

    const result = await ShipmentService.getShipments(
      req.user.organizationId,
      query,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getShipmentByIdController = async (
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
      res.status(400).json({ error: "Shipment ID is required" });
      return;
    }

    const shipment = await ShipmentService.getShipmentById(
      id,
      req.user.organizationId,
    );

    res.status(200).json({ data: shipment });
  } catch (error) {
    next(error);
  }
};
