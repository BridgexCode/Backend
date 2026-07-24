import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.types.js";
import {
  validateCreateShipment,
  validateAssignOperationsManager,
  validateUpdateShipmentStatus, 
  validateAssignDriver,
  validateUpdateShipment,
} from "./shipment.validation.js";
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
      req.user.id,
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

export const assignOperationsManagerController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateAssignOperationsManager(req.body);

    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Shipment ID is required" });
      return;
    }

    const shipment = await ShipmentService.assignOperationsManager(
      id as string,
      req.body.operationsManagerId,
      req.user.organizationId,
      req.user.id,
    );

    res.status(200).json({
      message: "Operations Manager assigned successfully",
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShipmentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateUpdateShipment(req.body);

    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Shipment ID is required" });
      return;
    }

    const shipment = await ShipmentService.updateShipment(
      id as string,
      req.body,
      req.user.organizationId,
      req.user.id,
    );

    res.status(200).json({
      message: "Shipment updated successfully",
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const assignDriverController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateAssignDriver(req.body);

    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Shipment ID is required" });
      return;
    }

    const shipment = await ShipmentService.assignDriver(
      id as string,
      req.body.driverId,
      req.user.organizationId,
      req.user.id,
      req.body.vehicleId,
    );

    res.status(200).json({
      message: "Driver assigned successfully",
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShipmentStatusController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateUpdateShipmentStatus(req.body);

    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Shipment ID is required" });
      return;
    }

    const shipment = await ShipmentService.updateShipmentStatus(
      id as string,
      req.body.status,
      req.user.organizationId,
      req.user.id,
    );

    res.status(200).json({
      message: "Shipment status updated successfully",   
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShipmentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Shipment ID is required" });
      return;
    }

    await ShipmentService.deleteShipment(id as string, req.user.organizationId);

    res.status(200).json({ message: "Shipment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getShipmentsTimelineController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.organizationId) {
      res.status(400).json({ error: "Organization ID not found" });
      return;
    }

    const timelineEvents = await ShipmentService.getOrganizationTimeline(
      req.user.organizationId,
    );

    res.status(200).json({ data: timelineEvents });
  } catch (error) {
    next(error);
  }
};
