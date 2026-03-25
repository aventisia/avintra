/**
 * Represents a data transfer object (DTO) for a Search Agent.
 */
export interface SearchAgentsDto {
  /**
   * Primary key of the flow version record.
   */
  id: string;

  /**
   * ID of the flow this version is associated with.
   */
  flowId: string;

  /**
   * Name of the flow version.
   */
  name: string;

  /**
   * Indicates whether the version is in draft state.
   */
  isDraft?: boolean;

  /**
   * Indicates whether the version is published.
   */
  isPublished?: boolean;

  /**
   * Indicates whether the version is locked.
   */
  isLocked?: boolean;

  /**
   * Indicates whether the version is archived.
   */
  isArchived?: boolean;

  /**
   * Username of the user who created the flow version.
   */
  createdBy?: string;

  /**
   * Email/username of the user who created the flow version.
   */
  createdByUsername?: string;

  /**
   * Date and time when the flow version was created.
   */
  createdOn?: Date | string;

  /**
   * Initials of the user who created the version.
   */
  createdByUserInitials?: string;

  /**
   * Version number.
   */
  versionNumber?: number;

  /**
   * Username of the user who last modified the flow version.
   */
  lastModifiedBy?: string | null;

  /**
   * Date and time when the flow version was last modified.
   */
  lastModifiedOn?: Date | string | null;
}
