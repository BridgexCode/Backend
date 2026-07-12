import { Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { AuthRequest } from "../auth/auth.types.js";
import * as SuperAdminService from "./superAdmin.service.js"
import { organizationIdSchema, updateOrganizationStatusSchema } from "./superAdmin.validation.js";

export const getDashboardController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const stats = await SuperAdminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

export const getOrganizationsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const organizations =
      await SuperAdminService.getAllOrganizations();

    res.status(200).json({
      success: true,
      data: organizations,
    });
  }
);

export const getOrganizationByIdController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = organizationIdSchema.parse(req.params);

    const organization =
      await SuperAdminService.getOrganizationById(id);

    res.status(200).json({
      success: true,
      data: organization,
    });
  },
);

export const updateOrganizationStatusController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = organizationIdSchema.parse(req.params);

    const { status } =
      updateOrganizationStatusSchema.parse(req.body);

    const organization =
      await SuperAdminService.updateOrganizationStatus(
        id,
        status,
      );

    res.status(200).json({
      success: true,
      data: organization,
    });
  },
);

export const deleteOrganizationController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = organizationIdSchema.parse(req.params);

    const result = await SuperAdminService.deleteOrganization(id);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);