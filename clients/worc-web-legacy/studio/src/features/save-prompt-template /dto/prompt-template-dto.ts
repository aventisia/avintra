import { TemplateAccessTypesEnum } from "../enums/template-access-type-enum";
import { ProjectTemplateTypesEnum } from "../enums/template-type-enum";

export interface PromptTemplateDto {
  id?: string;

  /** Name of the template (required) */
  name: string;

  /** Optional description of the template */
  description?: string;

  instruction?: string;

  /** Type of entity to save as "Prompt" */
  type: ProjectTemplateTypesEnum;

  /** Access level (e.g., 'Public', 'Tenant', 'Spaces') */
  accessType: TemplateAccessTypesEnum;

  /** Gets or sets the JSON schema that defines the template's structure and rules.*/
  schema?: string;

  /** Reference ID of the original flow or source */
  refId: string;

  /** Optional tags associated with the template */
  tags?: string[];

  icons?: string[];

  /** Optional list of file resources associated with the template */
  resources?: FileResource[] | null;

  /** Approval status of the template */
  status?: StatusType;

  remark?: string;

  /**
   * Gets or sets the username of the user who created the template. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the template was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the template. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the template was last modified.
   */
  lastModifiedOn?: Date;
}

/**
 * FileResource
 *
 * Represents a file attached to a template.
 */
export interface FileResource {
  name: string;
  size: number;
  path: string;
  extension: string;
}

export type StatusType = "Approved" | "Pending" | "Rejected" | undefined;
