import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { ComponentTypeEnum } from "../enums/component-type-enum";
import { ToolAuthenticationTypeEnum } from "../enums/tool-authentication-type-enum";
import { ManualToolOperation } from "./manual-tool-operation-dto";

/**
 * Represents a data transfer object (DTO) for a tool entry.
 */
export interface ToolDto {
  id?: string;

  /**
   * Name of the tool (max 255 chars).
   */
  name: string;

  /**
   * Optional short code or alias for the tool (max 100 chars).
   */
  code?: string;

  /**
   * Description of the tool.
   */
  description?: string;

  /**
   * Optional URL of the icon that represents the tool. When omitted, the
   * default placeholder icon is used.
   */
  iconUrl?: string;

  /**
   * Component type of the tool. Always Custom for user-created tools.
   */
  type: ComponentTypeEnum;

  /**
   * Base URL of the external API.
   */
  baseUrl: string;

  /**
   * Raw OpenAPI specification for the tool.
   */
  openApiSpec?: string;

  /**
   * Parsed LLM-friendly OpenAPI schema as JSON.
   */
  parsedSchema?: object;

  /**
   * Manually authored operations. Synthesized into an OpenAPI spec by the
   * backend when no spec is provided.
   */
  manualOperations?: ManualToolOperation[];

  /**
   * Authentication method required by the tool.
   */
  authenticationType?: ToolAuthenticationTypeEnum;

  /**
   * Unique name of the credential associated with the tool.
   */
  credentialName?: string;

  /**
   * Indicates whether the tool is accessible to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Indicates whether the tool is active and available for use.
   */
  isActive: boolean;

  /**
   * Indicates whether the tool has passed playground verification.
   */
  isVerified: boolean;

  /**
   * Optional flag indicating whether the tool record is disabled.
   */
  isDisabled?: boolean;

  /**
   * Access level of the tool record.
   */
  accessLevel: ResourceAccessTypeEnum;

  /**
   * Username of the user who created the tool record.
   */
  createdBy?: string;

  /**
   * Date and time when the tool record was created.
   */
  createdOn?: string;

  /**
   * Username of the user who last modified the tool record.
   */
  lastModifiedBy?: string;

  /**
   * Date and time when the tool record was last modified.
   */
  lastModifiedOn?: string;
}
