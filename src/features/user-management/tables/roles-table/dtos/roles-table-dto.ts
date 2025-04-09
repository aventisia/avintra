import { AccessType, Features } from "../constants/permissions-and-acesses";

export interface IRolePermission {
  permissionType: Features;
  accesses: AccessType[]; // e.g. ["view", "viewDelete"]
}

export interface RoleTableDTO {
  id: string;
  seq?: string;
  name: string;
  description?: string | null;
  isDisabled: boolean;
  totalPermission: number;
  rolePermissions: IRolePermission[];
  createdBy: string;
  lastUpdatedBy: string;
  createdOn: string | null;
  lastUpdatedOn: string | null;
  isDefault: boolean | null;
}
