import { z } from "zod";

export const organizationIdSchema = z.object({
  id: z
    .string()
    .min(1, "Organization ID is required")
});

export const updateOrganizationStatusSchema = z.object({
  status: z.enum(["active", "inactive"], {
    message: "Status must be either active or inactive",
  }),
});

export type UpdateOrganizationStatusInput = z.infer<
  typeof updateOrganizationStatusSchema
>;