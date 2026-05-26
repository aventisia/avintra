import { AccessType, Features } from "../constants/permissions-and-acesses";

export type RolePermission = {
  feature: Features;
  accesses: AccessType[]; // e.g. ["view", "viewDelete"]
};

export interface RoleTableDTO {
  id: string;
  seq?: string;
  fullName: string;
  tenantId?: string;
  tenantName?: string;
  description?: string | null;
  isDisabled: boolean;
  totalPermission: number;
  rolePermissions: RolePermission[];
  createdBy: string;
  lastUpdatedBy: string;
  createdOn: string | null;
  lastUpdatedOn: string | null;
  isDefault: boolean | null;
}
