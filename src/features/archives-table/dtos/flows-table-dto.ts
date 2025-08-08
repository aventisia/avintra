/**
 * Data transfer object for the agents table
 * @export
 * @interface ArchivesTableDto
 */
export interface ArchivesTableDto {
  /** Unique identifier for the agent record */
  id: string;

  /** Reference ID associated with the agent (e.g., flow or template ID) */
  refId: string;

  /** Name of the agent or flow */
  name: string | null;

  /** Type of the agent (e.g., 'Agent') */
  type: string;

  /** Count of machines using the agent */
  machineCount?: number;

  /** Indicates if the version is locked */
  isLocked: boolean;

  /** Indicates if the version is in draft state */
  isDraft: boolean;

  /** Indicates if the version has been published */
  isPublished: boolean;

  /** Indicates if the version has been archived */
  isArchived: boolean;

  /** Indicates if the version is disabled */
  isDisabled: boolean;

  /** Name of the user who created the record */
  createdBy: string | null;

  /** Username (email) of the user who created the record */
  createdByUsername: string | null;

  /** Date and time when the record was created */
  createdOn: string | Date;

  /** Version number of the record */
  versionNumber: number;

  /** Username of the user who last modified the record */
  lastModifiedBy?: string | null;

  /** Date and time when the record was last modified */
  lastModifiedOn?: string | Date;
}
