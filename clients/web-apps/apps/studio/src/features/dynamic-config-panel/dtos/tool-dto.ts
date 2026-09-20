import { ComponentTypeEnum } from "../enums/component-type-enum";
import { ToolAuthenticationTypeEnum } from "../enums/tool-authentication-type-enum";

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
