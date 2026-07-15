import { z } from "zod";

export const organizationIdSchema = z.object({
  id: z.string().min(1, "Organization ID is required"),
});

export const updateOrganizationStatusSchema = z.object({
  status: z.enum(["active", "inactive"], {
    message: "Status must be either active or inactive",
  }),
});

export const updateSettingsSchema = z.object({
  platformName: z.string().optional(),
  supportEmail: z.string().email().optional(),
  maxOrganizations: z.number().optional(),
  defaultLanguage: z.string().optional(),
  twoFactorAuth: z.boolean().optional(),
  passwordExpiry: z.boolean().optional(),
  sessionTimeout: z.number().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpEncryption: z.string().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  emailAlerts: z.boolean().optional(),
  newOrgSignup: z.boolean().optional(),
  errorReports: z.boolean().optional(),
});

export type UpdateOrganizationStatusInput = z.infer<typeof updateOrganizationStatusSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
