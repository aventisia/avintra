import type { ApiKeyPermissions } from "../dtos/api-key-permissions.dto";

export type ApiKeyPermissionKey = keyof ApiKeyPermissions;

export type PermissionItem = {
  id: ApiKeyPermissionKey;
  label: string;
  description: string;
};
