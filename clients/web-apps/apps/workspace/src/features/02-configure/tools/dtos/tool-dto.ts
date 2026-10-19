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

  description?: string;

  /**
   * Optional icon URL of the tool (max 1000 chars); blank uses the default placeholder icon.
   */
  iconUrl?: string;

  /**
   * Component type of the tool. Always Custom for user-created tools.
   */
  type: ComponentTypeEnum;

  baseUrl: string;

  openApiSpec?: string;

  /**
   * Parsed LLM-friendly OpenAPI schema as JSON.
   */
  parsedSchema?: object;

  /**
   * Manually authored operations, synthesized into an OpenAPI spec by the backend when no spec is provided.
   */
  manualOperations?: ManualToolOperation[];

  authenticationType?: ToolAuthenticationTypeEnum;

  credentialName?: string;

  isTenantWideAccess: boolean;

  isActive: boolean;

  /**
   * Indicates whether the tool has passed playground verification.
   */
  isVerified: boolean;

  isResourceAccessRestricted: boolean;

  accessLevel: ResourceAccessTypeEnum;

  isDisabled?: boolean;

  createdBy?: string;

  createdOn?: string;

  lastModifiedBy?: string;

  lastModifiedOn?: string;
}
