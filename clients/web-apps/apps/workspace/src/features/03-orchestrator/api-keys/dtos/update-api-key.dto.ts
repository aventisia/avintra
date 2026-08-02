import type { ApiKeyPermissions } from "./api-key-permissions.dto";

/**
 * Request payload for updating an existing API key. The key hash and plain key cannot be changed directly
 */
export interface UpdateApiKeyDto {
  /** The unique identifier of the API key to update. */
  id: string;

  /** The human-readable name of the API key (max length 255). */
  name: string;

  /** The optional expiration date and time of the API key. */
  expiresAt: string | null;

  /** The fixed permission object associated with the API key. */
  permissions: ApiKeyPermissions | null;

  /** A value indicating whether the API key is revoked. */
  isRevoked: boolean;
}
