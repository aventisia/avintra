import { ComponentTypeEnum } from "../enums/component-type-enum";
import { ToolAuthenticationTypeEnum } from "../enums/tool-authentication-type-enum";

/**
 * A single invocable operation exposed by a tool's OpenAPI specification.
 */
export interface UsableToolOperation {
  operationId: string;

  method?: string;

  path?: string;

  summary?: string;

  description?: string;

  parameters?: UsableToolParameter[];

  requestBody?: UsableToolRequestBody | null;

  response?: UsableToolResponse | null;

  /**
   * Optional per-operation icon path from the spec's `x-agent-node` extension.
   */
  icon?: string;

  /**
   * Optional per-operation accent color (hex) from the spec's `x-agent-node` extension.
   */
  color?: string;

  /**
   * Indicates whether the operation's last test returned HTTP 200; unverified operations are not selectable.
   */
  isVerified: boolean;
}

/**
 * A single OpenAPI operation parameter in simplified form.
 */
export interface UsableToolParameter {
  name: string;

  in?: string;

  required?: boolean;

  description?: string;

  type?: string;
}

/**
 * Simplified request-body metadata of an OpenAPI operation.
 */
export interface UsableToolRequestBody {
  required?: boolean;

  contentType?: string;

  properties?: UsableToolSchemaProperty[];
}

/**
 * Simplified success-response metadata of an OpenAPI operation.
 */
export interface UsableToolResponse {
  statusCode?: string;

  contentType?: string;

  properties?: UsableToolSchemaProperty[];
}

/**
 * A simplified schema property used in request-body and response summaries.
 */
export interface UsableToolSchemaProperty {
  name: string;

  type?: string;

  description?: string;

  /**
   * Whether the property is required (from the schema's required list).
   */
  required?: boolean;
}

/**
 * Slim view of a tool used for selection in flow configuration.
 */
export interface UsableToolDto {
  id: string;

  /**
   * Name of the tool (max 255 chars).
   */
  name: string;

  /**
   * Brand icon path for platform tools; undefined for custom/unknown tools.
   */
  icon?: string;

  description?: string;

  iconUrl?: string;

  /**
   * Component type of the tool. Always Custom for user-created tools.
   */
  type?: ComponentTypeEnum;

  authenticationType?: ToolAuthenticationTypeEnum;

  credentialName?: string;

  isActive: boolean;

  /**
   * Indicates whether the tool has passed playground verification.
   */
  isVerified: boolean;

  isDisabled: boolean;
}

/**
 * Operations exposed by a usable tool, together with the credential type required to invoke it.
 */
export interface UsableToolOperationsDto {
  credentialType?: string;

  operations: UsableToolOperation[];
}

/**
 * A usable tool together with its operations, as served by the combined usable-tool catalog endpoint.
 */
export interface UsableToolCatalogItemDto extends UsableToolDto {
  operations: UsableToolOperation[];
}
