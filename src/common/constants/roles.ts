export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ORGANIZATION_OWNER: "ORGANIZATION_OWNER",
  OPERATIONS_MANAGER: "OPERATIONS_MANAGER",
  WORKER: "WORKER"
} as const;

export type Role = typeof Roles[keyof typeof Roles];
