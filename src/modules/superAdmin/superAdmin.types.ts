export interface OrganizationResponse {
  _id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  plan?: string;
  status: "active" | "inactive";
  metadata?: Record<string, any>;
  totalUsers?: number;
  totalShipments?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DashboardResponse {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalShipments: number;
  recentActivity: RecentActivityItem[];
}

export interface RecentActivityItem {
  event: string;
  description: string;
  time: string;
  type: "info" | "error";
}

export interface MonthlyShipmentsReport {
  month: string;
  shipments: number;
}

export interface PlanDistributionReport {
  label: string;
  value: number;
  color: string;
  total: number;
}

export interface OrganizationGrowthReport {
  month: string;
  orgs: number;
}

export interface AuditLogResponse {
  id: string;
  event: string;
  description: string;
  user: string;
  userEmail: string;
  ip: string;
  timestamp: string;
  type: "info" | "warning" | "error";
}

export interface SystemSettingsResponse {
  platformName: string;
  supportEmail: string;
  maxOrganizations: number;
  defaultLanguage: string;
  twoFactorAuth: boolean;
  passwordExpiry: boolean;
  sessionTimeout: number;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: string;
  smtpUsername: string;
  smtpPassword: string;
  emailAlerts: boolean;
  newOrgSignup: boolean;
  errorReports: boolean;
}
