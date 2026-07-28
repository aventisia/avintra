/**
 * SaveAsTemplateDto
 *
 * Data Transfer Object used to save a flow as a template.
 * Intended for creating a new template.
 */
export interface SaveAsTemplateDto {
  id?: string;
  /** Name of the template (required) */
  name: string;

  /** Optional description of the template */
  description?: string;

  instruction: string;

  /** Type of entity to save as (e.g., 'Agent', 'Block') */
  type: string;

  /** Access level (e.g., 'Public', 'Tenant', 'Spaces') */
  accessType: string;

  /** Optional tags associated with the template */
  tags?: string[];

  remark?: string;
  /** Reference ID of the original flow or source */
  refId: string;
  icons?: string[];
  /** Approval status of the template */
  status?: StatusType;

  /** Optional list of file resources associated with the template */
  resources?: FileResource[] | null;

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
