import { ModelProviderEnum } from "../enums/model-provider-enum";

/**
 * Data Transfer Object representing a tenant-scoped model provider configuration,
 * including the selected vault credential and the list of enabled model identifiers.
 */
export interface TenantModelProviderDto {
  /** The unique identifier of the configuration record. Optional for create. */
  id?: string;

  /** The type of the external model provider. */
  providerType: ModelProviderEnum;

  /** The identifier of the vault credential associated with the provider. Null for URL-based providers (e.g. Ollama). */
  credentialId: string | null;

  /** The base URL for self-hosted providers (e.g. Ollama). Null/empty for credential-based providers. */
  providerUrl?: string | null;

  /** The list of model identifiers enabled for this provider. */
  enabledModelIds: string[];

  /** Whether this provider is disabled. Nullable to differentiate true/false/undefined. */
  isDisabled?: boolean | null;

  /** The username of the user who created the record. Informational only. */
  createdBy?: string;

  /** The date and time when the record was created. Informational only. */
  createdOn?: Date | string;

  /** The username of the user who last modified the record. Informational only. */
  lastModifiedBy?: string;

  /** The date and time when the record was last modified. Informational only. */
  lastModifiedOn?: Date | string;
}
