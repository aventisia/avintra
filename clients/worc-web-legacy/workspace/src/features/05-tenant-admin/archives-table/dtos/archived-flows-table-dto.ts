/**
 * Data transfer object for the archived flows table
 * @export
 * @interface ArchivedFlowsTableDto
 */
export interface ArchivedFlowsTableDto {
  /** Unique identifier for the archived flow record */
  id: string;

  /** Reference ID associated with the archived flow (e.g., flow or template ID) */
  refId: string;

  /** Name of the archived flow */
  name: string | null;

  /** Type of the archived flow (e.g., 'Agent') */
  type: string;

  /** Count of machines using the archived flow */
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
