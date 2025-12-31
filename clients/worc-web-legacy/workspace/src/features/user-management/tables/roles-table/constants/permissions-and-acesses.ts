export enum Features {
  Roles = "Roles",
  Projects = "Projects",
  Templates = "Templates",
  Clients = "Clients",
  AgentsManager = "Agents Manager",
  UserManager = "User Manager",
  BillingManager = "Billing Manager",
  TenantManager = "Tenant Manager",
}

export enum AccessType {
  FullAccess = "Full",
  View = "View",
  Create = "Create",
  Edit = "Edit",
  Delete = "Delete",
}
interface RoleInfo {
  id: Features;
  name: string;
  tooltip: string;
}

interface PermissionInfo {
  id: AccessType;
  name: string;
}

// Define the roles and permissions
export const roles: RoleInfo[] = [
  {
    id: Features.Roles,
    name: Features.Roles,
    tooltip: "Roles; Represents user roles in the system.",
  },
  {
    id: Features.Projects,
    name: Features.Projects,
    tooltip: "Projects; Represents project-related data.",
  },
  {
    id: Features.Templates,
    name: Features.Templates,
    tooltip: "Templates; Represents reusable templates for various modules.",
  },
  {
    id: Features.Clients,
    name: Features.Clients,
    tooltip: "Clients; Represents client data and related access.",
  },
  {
    id: Features.AgentsManager,
    name: Features.AgentsManager,
    tooltip: "Agents Manager; Manages agent-related permissions and data.",
  },

  {
    id: Features.UserManager,
    name: Features.UserManager,
    tooltip: "User Manager; Manages user accounts and roles.",
  },
  {
    id: Features.BillingManager,
    name: Features.BillingManager,
    tooltip: "Billing Manager; Handles billing and payment-related access.",
  },
  {
    id: Features.TenantManager,
    name: Features.TenantManager,
    tooltip: "Tenant Manager; Manages tenant-specific configurations and data.",
  },
];

export const permissionTypes: PermissionInfo[] = [
  { id: AccessType.FullAccess, name: AccessType.FullAccess },
  { id: AccessType.View, name: AccessType.View },
  { id: AccessType.Create, name: AccessType.Create },
  { id: AccessType.Edit, name: AccessType.Edit },
  { id: AccessType.Delete, name: AccessType.Delete },
];

export const PERMISSIONS = Object.values(Features);
export const ACCESSES = Object.values(AccessType);
