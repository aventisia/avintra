import { API_KEY_PERMISSION_ITEMS } from "../constants/api-key-permissions.constant";
import type { ApiKeyPermissions } from "../dtos/api-key-permissions.dto";

/**
 * Returns the default permission object with all features disabled.
 */
export const buildDefaultPermissions = (): ApiKeyPermissions => {
  return {
    machineAuth: false,
    webhookTrigger: false,
    createQueueWorkItem: false,
    cloudExecution: false,
  };
};

/**
 * Normalizes a permissions object coming from the API into the fixed form shape.
 * Any missing or non-boolean value defaults to false.
 */
export const normalizePermissions = (
  permissions: ApiKeyPermissions | Record<string, unknown> | null | undefined,
): ApiKeyPermissions => {
  const defaults = buildDefaultPermissions();
  if (!permissions) return defaults;

  return {
    machineAuth: Boolean(permissions.machineAuth),
    webhookTrigger: Boolean(permissions.webhookTrigger),
    createQueueWorkItem: Boolean(permissions.createQueueWorkItem),
    cloudExecution: Boolean(permissions.cloudExecution),
  };
};

/**
 * Formats an API key permissions object into a concise summary for display.
 * Returns a comma-separated list of enabled permission labels, or "-" if none are enabled.
 */
export const formatPermissions = (permissions: ApiKeyPermissions | null | undefined): string => {
  if (!permissions) return "-";

  const enabled = API_KEY_PERMISSION_ITEMS.filter((item) => permissions[item.id]).map(
    (item) => item.label,
  );

  return enabled.length > 0 ? enabled.join(", ") : "-";
};
