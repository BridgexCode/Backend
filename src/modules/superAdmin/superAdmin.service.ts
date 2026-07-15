import mongoose from "mongoose";
import { AppError } from "../../common/errors/app-error.js";
import {
  OrganizationResponse,
  DashboardResponse,
  MonthlyShipmentsReport,
  PlanDistributionReport,
  OrganizationGrowthReport,
  AuditLogResponse,
  SystemSettingsResponse,
} from "./superAdmin.types.js";

const mapOrganizationResponse = (doc: any): OrganizationResponse => ({
  _id: doc._id.toString(),
  name: doc.name,
  slug: doc.slug,
  email: doc.email || "",
  phone: doc.metadata?.phone || "",
  plan: doc.plan || "FREE",
  status: doc.status || "active",
  metadata: doc.metadata,
  totalUsers: doc.totalUsers || 0,
  totalShipments: doc.totalShipments || 0,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const getAllOrganizations = async (): Promise<OrganizationResponse[]> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const docs = await db
    .collection("organization")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const orgs = docs.map(mapOrganizationResponse);

  // Fetch admin email for orgs that have empty email
  const emailFixes = await Promise.all(
    orgs.map(async (org) => {
      if (org.email) return null;
      const owner = await db.collection("member").findOne(
        { organizationId: new mongoose.Types.ObjectId(org._id), role: "owner" },
      );
      if (!owner) return null;
      const userId = owner.userId?.toString ? owner.userId.toString() : owner.userId;
      const user = await db.collection("user").findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      return user?.email || null;
    }),
  );

  const [userCounts, shipmentCounts] = await Promise.all([
    Promise.all(
      orgs.map((org) =>
        db.collection("member").countDocuments({ organizationId: new mongoose.Types.ObjectId(org._id) }),
      ),
    ),
    Promise.all(
      orgs.map((org) =>
        db.collection("shipment").countDocuments({ orgId: new mongoose.Types.ObjectId(org._id) }),
      ),
    ),
  ]);

  return orgs.map((org, i) => ({
    ...org,
    email: emailFixes[i] || org.email,
    totalUsers: userCounts[i],
    totalShipments: shipmentCounts[i],
  }));
};

export const getOrganizationById = async (
  organizationId: string,
): Promise<OrganizationResponse> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(organizationId);
  } catch {
    throw new AppError(400, "Invalid organization ID format");
  }

  const doc = await db.collection("organization").findOne({ _id: objectId });
  if (!doc) throw new AppError(404, "Organization not found");

  const org = mapOrganizationResponse(doc);

  // Fix empty email
  if (!org.email) {
    const owner = await db.collection("member").findOne(
      { organizationId: objectId, role: "owner" },
    );
    if (owner) {
      const userId = owner.userId?.toString ? owner.userId.toString() : owner.userId;
      const user = await db.collection("user").findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      org.email = user?.email || "";
    }
  }

  const [totalUsers, totalShipments] = await Promise.all([
    db.collection("member").countDocuments({ organizationId: objectId }),
    db.collection("shipment").countDocuments({ orgId: objectId }),
  ]);

  return { ...org, totalUsers, totalShipments };
};

export const getDashboardStats = async (): Promise<DashboardResponse> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const [totalOrganizations, totalUsers, totalShipments, auditLogs] = await Promise.all([
    db.collection("organization").countDocuments(),
    db.collection("user").countDocuments({ isDeleted: { $ne: true } }),
    db.collection("shipment").countDocuments(),
    db.collection("auditLog").find().sort({ timestamp: -1 }).limit(4).toArray(),
  ]);

  const activeOrgs = await db.collection("organization").countDocuments({ status: "active" });

  const recentActivity: DashboardResponse["recentActivity"] = auditLogs.map((log: any) => ({
    event: log.event,
    description: log.description,
    time: formatRelativeTime(log.timestamp),
    type: log.type === "error" ? "error" as const : "info" as const,
  }));

  return {
    totalOrganizations,
    activeOrganizations: activeOrgs,
    totalUsers,
    totalShipments,
    recentActivity,
  };
};

export const updateOrganizationStatus = async (
  organizationId: string,
  status: "active" | "inactive",
): Promise<OrganizationResponse> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(organizationId);
  } catch {
    throw new AppError(400, "Invalid organization ID format");
  }

  const organization = await db.collection("organization").findOne({ _id: objectId });
  if (!organization) throw new AppError(404, "Organization not found");

  await db.collection("organization").updateOne(
    { _id: objectId },
    { $set: { status, updatedAt: new Date() } },
  );

  await db.collection("auditLog").insertOne({
    event: status === "active" ? "Organization Activated" : "Organization Suspended",
    description: `${organization.name} ${status === "active" ? "activated" : "suspended"} by super admin`,
    user: "System Admin",
    userEmail: "admin@naxivo.com",
    ip: "",
    type: status === "inactive" ? "error" : "info",
    timestamp: new Date(),
  });

  const updatedDoc = await db.collection("organization").findOne({ _id: objectId });
  if (!updatedDoc) throw new AppError(404, "Organization not found after update");
  return mapOrganizationResponse(updatedDoc);
};

export const deleteOrganization = async (
  organizationId: string,
): Promise<{ message: string }> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(organizationId);
  } catch {
    throw new AppError(400, "Invalid organization ID format");
  }

  const organization = await db.collection("organization").findOne({ _id: objectId });
  if (!organization) throw new AppError(404, "Organization not found");

  await Promise.all([
    db.collection("organization").deleteOne({ _id: objectId }),
    db.collection("member").deleteMany({ organizationId: organizationId }),
    db.collection("shipment").deleteMany({ orgId: objectId }),
  ]);

  return { message: "Organization deleted successfully" };
};

export const getMonthlyShipmentsReport = async (): Promise<MonthlyShipmentsReport[]> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const shipments = await db.collection("shipment").find({
    createdAt: { $gte: sixMonthsAgo },
  }).toArray();

  const monthMap: Record<string, number> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    monthMap[key] = 0;
  }

  for (const s of shipments) {
    const d = new Date(s.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (monthMap[key] !== undefined) {
      monthMap[key]++;
    }
  }

  return Object.entries(monthMap).map(([month, shipments]) => ({
    month,
    shipments,
  }));
};

export const getPlanDistribution = async (): Promise<PlanDistributionReport[]> => {
  const orgs = await getAllOrganizations();
  const plans: Record<string, number> = {};
  for (const org of orgs) {
    const plan = org.plan || "FREE";
    plans[plan] = (plans[plan] || 0) + 1;
  }
  const colorMap: Record<string, string> = {
    ENTERPRISE: "#8b5cf6",
    PRO: "#3b82f6",
    FREE: "#94a3b8",
  };
  const total = orgs.length || 1;
  return Object.entries(plans).map(([label, value]) => ({
    label,
    value,
    color: colorMap[label] || "#94a3b8",
    total,
  }));
};

export const getOrganizationGrowth = async (): Promise<OrganizationGrowthReport[]> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const orgs = await db.collection("organization").find({
    createdAt: { $gte: sixMonthsAgo },
  }).toArray();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthMap: Record<string, number> = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = monthNames[d.getMonth()];
    monthMap[key] = 0;
  }

  for (const org of orgs) {
    const d = new Date(org.createdAt);
    const key = monthNames[d.getMonth()];
    if (monthMap[key] !== undefined) {
      monthMap[key]++;
    }
  }

  let cumulative = 0;
  return Object.entries(monthMap).map(([month, orgs]) => {
    cumulative += orgs;
    return { month, orgs: cumulative };
  });
};

export const getAuditLogs = async (
  search?: string,
  typeFilter?: string,
): Promise<AuditLogResponse[]> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const filter: Record<string, any> = {};
  if (typeFilter && typeFilter !== "ALL") {
    filter.type = typeFilter;
  }

  let logs = await db.collection("auditLog")
    .find(filter)
    .sort({ timestamp: -1 })
    .toArray();

  if (search) {
    const s = search.toLowerCase();
    logs = logs.filter((log: any) =>
      log.event?.toLowerCase().includes(s) ||
      log.user?.toLowerCase().includes(s) ||
      log.description?.toLowerCase().includes(s),
    );
  }

  return logs.map((log: any) => ({
    id: log._id.toString(),
    event: log.event,
    description: log.description,
    user: log.user,
    userEmail: log.userEmail,
    ip: log.ip,
    timestamp: formatTimestamp(log.timestamp),
    type: log.type,
  }));
};

export const getSettings = async (): Promise<SystemSettingsResponse> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  const defaults: SystemSettingsResponse = {
    platformName: "Naxivo ERP",
    supportEmail: "support@naxivo.com",
    maxOrganizations: 50,
    defaultLanguage: "English",
    twoFactorAuth: true,
    passwordExpiry: false,
    sessionTimeout: 60,
    smtpHost: "smtp.naxivo.com",
    smtpPort: 587,
    smtpEncryption: "TLS",
    smtpUsername: "noreply@naxivo.com",
    smtpPassword: "",
    emailAlerts: true,
    newOrgSignup: true,
    errorReports: true,
  };

  const doc = await db.collection("systemSetting").findOne({ _id: "global" as any });
  if (!doc) return defaults;

  return { ...defaults, ...doc.settings };
};

export const updateSettings = async (
  settings: Partial<SystemSettingsResponse>,
): Promise<SystemSettingsResponse> => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError(500, "Database connection not ready");

  await db.collection("systemSetting").updateOne(
    { _id: "global" as any },
    { $set: { settings, updatedAt: new Date() } },
    { upsert: true },
  );

  await db.collection("auditLog").insertOne({
    event: "System Settings Updated",
    description: "System settings were modified by super admin",
    user: "System Admin",
    userEmail: "admin@naxivo.com",
    ip: "",
    type: "info",
    timestamp: new Date(),
  });

  return getSettings();
};

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString();
}

function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
