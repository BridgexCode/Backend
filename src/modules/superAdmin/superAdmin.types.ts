export interface OrganizationResponse {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface DashboardResponse {
  totalOrganizations: number;
}