/**
 * Represents a tenant-scoped model provider configuration,
 * matching the Workspace `tenant-model-provider` DTO.
 */
export interface TenantModelProviderDto {
  /** The unique identifier of the configuration record. */
  id?: string;

  /** The type of the external model provider (e.g. "OpenAI", "Gemini"). */
  providerType: string;

  /** The identifier of the vault credential associated with the provider. Null for URL-based providers (e.g. Ollama). */
  credentialId: string | null;

  /** The base URL for self-hosted providers (e.g. Ollama). */
  providerUrl?: string | null;

  /** The list of model identifiers enabled for this provider. */
  enabledModelIds: string[];

  /** Whether this provider is disabled. */
  isDisabled?: boolean | null;
}
