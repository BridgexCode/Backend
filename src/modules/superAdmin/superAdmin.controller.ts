import { Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { AuthRequest } from "../auth/auth.types.js";
import * as SuperAdminService from "./superAdmin.service.js";
import { organizationIdSchema, updateOrganizationStatusSchema } from "./superAdmin.validation.js";

export const getDashboardController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const stats = await SuperAdminService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  },
);

export const getOrganizationsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = {
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
    };
    const result = await SuperAdminService.getAllOrganizations(query);
    res.status(200).json({ success: true, ...result });
  },
);

export const getOrganizationByIdController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = organizationIdSchema.parse(req.params);
    const organization = await SuperAdminService.getOrganizationById(id);
    res.status(200).json({ success: true, data: organization });
  },
);

export const updateOrganizationStatusController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = organizationIdSchema.parse(req.params);
    const { status } = updateOrganizationStatusSchema.parse(req.body);
    const organization = await SuperAdminService.updateOrganizationStatus(id, status);
    res.status(200).json({ success: true, data: organization });
  },
);

export const deleteOrganizationController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = organizationIdSchema.parse(req.params);
    const result = await SuperAdminService.deleteOrganization(id);
    res.status(200).json({ success: true, ...result });
  },
);

export const getMonthlyShipmentsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const data = await SuperAdminService.getMonthlyShipmentsReport();
    res.status(200).json({ success: true, data });
  },
);

export const getPlanDistributionController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const data = await SuperAdminService.getPlanDistribution();
    res.status(200).json({ success: true, data });
  },
);

export const getOrganizationGrowthController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const data = await SuperAdminService.getOrganizationGrowth();
    res.status(200).json({ success: true, data });
  },
);

export const getAuditLogsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = {
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
      search: req.query.search as string | undefined,
      type: req.query.type as string | undefined,
    };
    const result = await SuperAdminService.getAuditLogs(query);
    res.status(200).json({ success: true, ...result });
  },
);

export const getSettingsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const settings = await SuperAdminService.getSettings();
    res.status(200).json({ success: true, data: settings });
  },
);

export const updateSettingsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const settings = await SuperAdminService.updateSettings(req.body);
    res.status(200).json({ success: true, data: settings });
  },
);
