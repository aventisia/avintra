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

  /** Description of the template */
  description?: string;

  /** Instruction of the template's purpose or content markdown */
  instruction: string;

  /** Current approval status of the template */
  status?: StatusType;

  /** Remarks or reviewer comments about the template */
  remark?: string;

  /** Path to access or use this template */
  accessPath: string;

  /** Type of the template (e.g., 'Agent', 'Model') */
  type?: string;

  /** Access level of the template (e.g., 'Public', 'Tenant') */
  accessType?: string;

  /** ID of the workspace/space where this template belongs */
  spaceId?: string;

  /** JSON schema definition of the template, if applicable */
  schema?: string;

  /** Version of the schema definition */
  schemaVersion?: number;

  /** Reference ID linked to the actual model or agent */
  refId: string;

  /** Optional tags for categorization or filtering */
  tags?: string[];

  /** Number of times the template has been used */
  usageCount?: number;

  /** List of icon URLs or identifiers associated with the template */
  icons?: string[];

  /** File resources (attachments, documents, etc.) linked to the template */
  resources?: FileResource[];

  /** Indicates whether the template is disabled */
  isDisabled?: boolean;

  /** Username of the user who created the template */
  createdBy?: string;

  /** Date and time when the template was created */
  createdOn?: Date;

  /** Username of the user who last modified the template */
  lastModifiedBy?: string;

  /** Date and time when the template was last modified */
  lastModifiedOn?: Date;
}

/**
 * FileResource
 *
 * Represents a file resource (e.g., attachment) linked to a template.
 */
export interface FileResource {
  /** Original name of the file */
  name: string;

  /** File size in bytes */
  size: number;

  /** Path or URL to access the file */
  path: string;

  /** File extension (e.g., '.pdf', '.jpg') */
  extension: string;
}

/** Status options for a template */
export type StatusType = "Approved" | "Pending" | "Rejected" | undefined;
