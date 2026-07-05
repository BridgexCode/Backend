import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.types.js";
import * as DashboardService from "../userDashboard/dashboard.service.js";

export const getDashboardStatsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization not found",
      });
    }

    const stats =
      await DashboardService.getDashboardStats(organizationId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};