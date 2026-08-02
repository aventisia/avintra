import type { ApiKeyDto } from "./api-key.dto";

/**
 * Response payload returned when an API key is created. Inherits the standard API key display fields and adds the plain key returned exactly once.
 */
export interface CreateApiKeyResDto extends ApiKeyDto {
  /** The plain API key. This value is returned only on creation and is never stored or returned again. */
  plainApiKey: string | null;
}
