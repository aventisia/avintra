import type { ApiKeyPermissions } from "./api-key-permissions.dto";

/**
 * Response data for an API key, returned by list, get-by-id, and update endpoints.
 * The plain key is never returned; only the masked KeyPrefix is exposed.
 */
export interface ApiKeyDto {
  /** The unique identifier of the API key. */
  id: string;

  /** The human-readable name of the API key (max length 255). */
  name: string;

  /** The masked prefix of the API key shown in the UI (e.g., "av-3q1..."). */
  keyPrefix: string | null;

  /** The optional expiration date and time of the API key. */
  expiresAt: string | null;

  /** The date and time when the API key was last used. */
  lastUsedAt: string | null;

  /** A value indicating whether the API key is revoked. */
  isRevoked: boolean;

  /** The fixed permission object associated with the API key. */
  permissions: ApiKeyPermissions | null;

  /** The full name of the user who created the API key. */
  createdBy: string | null;

  /** The date and time when the API key was created. */
  createdOn: string | null;

  /** The full name of the user who last modified the API key. */
  lastModifiedBy: string | null;

  /** The date and time when the API key was last modified. */
  lastModifiedOn: string | null;
}
