import { ComponentTypeEnum } from "../enums/component-type-enum";
import { ToolAuthenticationTypeEnum } from "../enums/tool-authentication-type-enum";

/**
 * Full tool record as returned by the personal tools list endpoint.
 */
export interface ToolDto {
  /**
   * Unique identifier of the tool.
   */
  id: string;

  /**
   * Name of the tool (max 255 chars).
   */
  name: string;

  /**
   * Brand icon path for platform tools; undefined for custom/unknown tools.
   */
  icon?: string;

  /**
   * Description of the tool.
   */
  description?: string;

  /**
   * Component type of the tool.
   */
  type?: ComponentTypeEnum;

  /**
   * Base URL of the API the tool wraps.
   */
  baseUrl?: string;

  /**
   * Authentication method required by the tool.
   */
  authenticationType?: ToolAuthenticationTypeEnum;

  /**
   * Unique name of the credential associated with the tool.
   */
  credentialName?: string;

  /**
   * Indicates whether the tool is active and available for use.
   */
  isActive: boolean;

  /**
   * Indicates whether the tool has passed playground verification.
   */
  isVerified: boolean;

  /**
   * Indicates whether the tool record is disabled.
   */
  isDisabled?: boolean;
}

/**
 * A single invocable operation exposed by a tool's OpenAPI specification.
 */
export interface UsableToolOperation {
  /**
   * OpenAPI operation identifier.
   */
  operationId: string;

  /**
   * HTTP method of the operation.
   */
  method?: string;

  /**
   * Request path of the operation.
   */
  path?: string;

  /**
   * Human-readable summary of the operation.
   */
  summary?: string;

  /**
   * Detailed description of the operation from the OpenAPI spec.
   */
  description?: string;

  /**
   * Simplified parameter list (name, location, required, description, type).
   */
  parameters?: UsableToolParameter[];

  /**
   * Simplified request-body metadata (required, content type, properties).
   */
  requestBody?: UsableToolRequestBody | null;

  /**
   * Simplified success-response metadata (status code, content type, properties).
   */
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
   * Indicates whether the operation has been verified (its last test returned
   * HTTP 200). Unverified operations are not selectable in the action selector.
   */
  isVerified: boolean;
}

/**
 * A single OpenAPI operation parameter in simplified form.
 */
export interface UsableToolParameter {
  /**
   * Parameter name.
   */
  name: string;

  /**
   * Parameter location: "path", "query", "header" or "cookie".
   */
  in?: string;

  /**
   * Whether the parameter is required.
   */
  required?: boolean;

  /**
   * Parameter description.
   */
  description?: string;

  /**
   * Simplified schema type ("string", "number", "boolean", …).
   */
  type?: string;
}

/**
 * Simplified request-body metadata of an OpenAPI operation.
 */
export interface UsableToolRequestBody {
  /**
   * Whether the request body is required.
   */
  required?: boolean;

  /**
   * Content type of the body (e.g. "application/json").
   */
  contentType?: string;

  /**
   * Simplified schema properties of the body.
   */
  properties?: UsableToolSchemaProperty[];
}

/**
 * Simplified success-response metadata of an OpenAPI operation.
 */
export interface UsableToolResponse {
  /**
   * HTTP status code of the success response (e.g. "200").
   */
  statusCode?: string;

  /**
   * Content type of the response (e.g. "application/json").
   */
  contentType?: string;

  /**
   * Simplified schema properties of the response body.
   */
  properties?: UsableToolSchemaProperty[];
}

/**
 * A simplified schema property used in request-body and response summaries.
 */
export interface UsableToolSchemaProperty {
  /**
   * Property name.
   */
  name: string;

  /**
   * Property schema type.
   */
  type?: string;

  /**
   * Property description.
   */
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
  /**
   * Unique identifier of the tool.
   */
  id: string;

  /**
   * Name of the tool (max 255 chars).
   */
  name: string;

  /**
   * Brand icon path for platform tools; undefined for custom/unknown tools.
   */
  icon?: string;

  /**
   * Description of the tool.
   */
  description?: string;

  /**
   * Component type of the tool. Always Custom for user-created tools.
   */
  type?: ComponentTypeEnum;

  /**
   * Authentication method required by the tool.
   */
  authenticationType?: ToolAuthenticationTypeEnum;

  /**
   * Unique name of the credential associated with the tool.
   */
  credentialName?: string;

  /**
   * Indicates whether the tool is active and available for use.
   */
  isActive: boolean;

  /**
   * Indicates whether the tool has passed playground verification.
   */
  isVerified: boolean;

  /**
   * Indicates whether the tool record is disabled.
   */
  isDisabled: boolean;
}

/**
 * Operations exposed by a usable tool, together with the credential type required
 * to invoke it.
 */
export interface UsableToolOperationsDto {
  /**
   * Credential (vault) type to filter credentials by, when resolvable.
   */
  credentialType?: string;

  /**
   * Operations exposed by the tool's OpenAPI specification.
   */
  operations: UsableToolOperation[];
}

/**
 * A usable tool together with its operations, as served by the combined
 * usable-tool catalog endpoint (`GET /tools/usable/catalog`).
 */
export interface UsableToolCatalogItemDto extends UsableToolDto {
  /**
   * Operations exposed by the tool's OpenAPI specification.
   */
  operations: UsableToolOperation[];
}
