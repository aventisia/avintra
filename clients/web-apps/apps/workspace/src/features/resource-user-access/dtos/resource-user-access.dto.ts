import { ResourceAccessTypeEnum } from "../enums/resource-access-type-enum";
import { ResourceTypeEnum } from "../enums/resource-type-enum";

export interface ResourceUserAccessRecipientDto {
  accessLevel: ResourceAccessTypeEnum;
  userId: string;
}

export interface CreateResourceUserAccessDto {
  resourceType: ResourceTypeEnum;
  resourceId: string;
  users: ResourceUserAccessRecipientDto[];
}

export interface UpdateTenantWideAccessDto {
  resourceType: ResourceTypeEnum;
  resourceId: string;
  isTenantWideAccess: boolean;
}

export interface ResourceUserAccessDto {
  id: string;
  tenantId: string;
  resourceType: ResourceTypeEnum;
  resourceId: string;
  accessLevel: ResourceAccessTypeEnum;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}
