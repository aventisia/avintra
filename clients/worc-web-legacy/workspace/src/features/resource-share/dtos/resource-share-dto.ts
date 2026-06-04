import { ResourceAccessTypeEnum } from "../enums/resource-access-type-enum";
import { ResourceTypeEnum } from "../enums/resource-type-enum";

export interface ResourceShareRecipientDto {
  accessLevel: ResourceAccessTypeEnum;
  userId: string;
}

export interface CreateResourceShareDto {
  resourceType: ResourceTypeEnum;
  resourceId: string;
  users: ResourceShareRecipientDto[];
}

export interface ResourceShareDto {
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
