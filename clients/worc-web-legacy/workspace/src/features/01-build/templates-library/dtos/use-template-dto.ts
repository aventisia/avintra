/**
 * UseTemplateDTO
 *
 * Data Transfer Object used when applying a saved template (e.g., model or agent).
 */
export interface UseTemplateDTO {
  /** Unique identifier of the template */
  id: string;

  /** Display name of the template */
  name: string;

  /** Description of the template's purpose or content */
  description: string;

  instruction?: string;

  /** Reference ID linked to the actual model or agent */
  refId: string;

  /** Optional type of the template (e.g., 'Agent', 'Model') */
  type?: string;

  /** Optional access level (e.g., 'Public', 'Tenant') */
  accessType?: string;

  accessPath?: string;

  /** Optional tags for categorization or filtering */
  tags?: string[];

  resources?: FileResource[];

  schema?: string;

  /** Optional purpose or intent of the template */
  status?: StatusType;

  schemaVersion?: number;

  usageCount?: number;

  icons?: string[];

  /**
   * Gets or sets the username of the user who created the flow record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the flow record was created.
   */
  createdOn?: Date;
  /**
   * Gets or sets the username of the user who last modified the flow record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the flow record was last modified.
   */
  lastModifiedOn?: Date;
}

export interface FileResource {
  name: string;
  size: number;
  path: string;
  extension: string;
}

export type StatusType = "Approved" | "Pending" | "Rejected" | undefined;
