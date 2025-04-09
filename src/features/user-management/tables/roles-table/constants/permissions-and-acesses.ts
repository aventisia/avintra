export enum Features {
  PROJECTS = "Projects",
  TEMPLATES = "Templates",
  CLIENTS = "Clients",
  AGENTS_MANAGER = "Agent Manager",
  USER_MANAGER = "User Manager",
  BILLING_MANAGER = "Billing Manager",
  TENANT_MANAGER = "Tenant Manager",
}

export enum AccessType {
  FULL = "Full",
  VIEW = "View",
  CREATE = "Create",
  EDIT = "Edit",
  DELETE = "Delete",
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
    id: Features.PROJECTS,
    name: Features.PROJECTS,
    tooltip: "Feature of projects.",
  },
  {
    id: Features.TEMPLATES,
    name: Features.TEMPLATES,
    tooltip: "Feature of project templates.",
  },
  {
    id: Features.CLIENTS,
    name: Features.CLIENTS,
    tooltip: "Feature of client management.",
  },
  {
    id: Features.AGENTS_MANAGER,
    name: Features.AGENTS_MANAGER,
    tooltip: "Feature of ai agents management.",
  },

  {
    id: Features.USER_MANAGER,
    name: Features.USER_MANAGER,
    tooltip: "Feature of User management.",
  },
  {
    id: Features.BILLING_MANAGER,
    name: Features.BILLING_MANAGER,
    tooltip: "Feature of billing management.",
  },
  {
    id: Features.TENANT_MANAGER,
    name: Features.TENANT_MANAGER,
    tooltip: "Feature of tenants management.",
  },
];

export const permissionTypes: PermissionInfo[] = [
  { id: AccessType.FULL, name: AccessType.FULL },
  { id: AccessType.VIEW, name: AccessType.VIEW },
  { id: AccessType.CREATE, name: AccessType.CREATE },
  { id: AccessType.EDIT, name: AccessType.EDIT },
  { id: AccessType.DELETE, name: AccessType.DELETE },
];

export const PERMISSIONS = Object.values(Features);
export const ACCESSES = Object.values(AccessType);
