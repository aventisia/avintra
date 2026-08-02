import type { ApiKeyPermissions } from "./api-key-permissions.dto";

/**
 * Request payload for creating a new API key. The plain key is generated server-side and returned only once in the response.
 */
export interface CreateApiKeyReqDto {
  /** The human-readable name of the API key (max length 255). */
  name: string;

  /** The optional expiration date and time of the API key. */
  expiresAt: string | null;

  /** The fixed permission object associated with the API key. */
  permissions: ApiKeyPermissions | null;
}
