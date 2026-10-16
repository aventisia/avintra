/**
 * Represents a published custom UI builder project shown in the Published table.
 */
export interface PublishedUiDto {
  /** Gets or sets the primary key of the project record. */
  id: string;

  /** Gets or sets the name of the project. Max-255 */
  name: string;

  /** Gets or sets the description of the project. Max-500 */
  description?: string;

  /** Indicates whether the project is accessible to all users within the tenant. */
  isTenantWideAccess: boolean;

  /** Indicates whether the project has been published. */
  isPublished: boolean;

  /** Indicates whether the published project is visible to all users within the tenant. */
  isPublishedTenantWide: boolean;

  /** Gets the number of generated versions stored for the project. */
  versionCount: number;

  /** Gets the number of the newest generated version for the project. */
  headVersionNumber: number;

  /** Gets the pinned published version number assignees see. */
  publishedVersionNumber?: number;

  /** Gets or sets the permission level granted to the user. */
  accessLevel?: string;

  /** Gets or sets a flag indicating whether the project record is disabled. */
  isDisabled: boolean;

  /** Gets or sets the username of the user who created the project record. */
  createdBy?: string | null;

  /** Gets or sets the date and time when the project record was created. */
  createdOn?: Date;

  /** Gets or sets the username of the user who last modified the project record. */
  lastModifiedBy?: string | null;

  /** Gets or sets the date and time when the project record was last modified. */
  lastModifiedOn?: Date;
}

/**
 * Represents a generated UI builder version rendered read-only.
 */
export interface PublishedUiVersionDto {
  /** Gets or sets the version record's primary key. */
  id: string;

  /** Gets or sets the ID of the project this version belongs to. */
  uiBuilderProjectId: string;

  /** Gets or sets the sequential version number within the project. */
  versionNumber: number;

  /** Gets or sets the prompt that produced this version. */
  promptText: string;

  /** Gets or sets the full standalone HTML document generated for this version. */
  generatedHtml: string;

  /** Gets or sets the output format marker for this version ("html" or "framework"). */
  contentFormat: string;

  /** Gets or sets the JSX source artifact for framework versions, or null for html versions. */
  sourceArtifact?: string | null;

  /** Gets or sets the wire provider used for generation. */
  provider: string;

  /** Gets or sets the model used for generation. */
  model: string;

  /** Gets or sets the username of the user who created the version record. */
  createdBy?: string | null;

  /** Gets or sets the date and time when the version record was created. */
  createdOn?: Date;
}

/**
 * Represents a read-only published view of a UI builder project and its pinned published version.
 */
export interface PublishedUiViewDto {
  /** Gets or sets the published project details. */
  project?: PublishedUiDto | null;

  /** Gets or sets the pinned published version, or null when the project has no published version. */
  headVersion?: PublishedUiVersionDto | null;
}

/**
 * Represents a user assigned to a published UI builder project.
 */
export interface PublishedUiUserDto {
  /** Unique identifier for the UI builder project user. */
  id?: string;

  /** Unique identifier for the user associated with the project. */
  userId?: string;

  /** First name of the user associated with the project. */
  firstName?: string | null;

  /** Last name of the user associated with the project. */
  lastName?: string | null;

  /** Username of the user associated with the project. */
  username?: string | null;

  /** Initials of the user associated with the project. */
  initials?: string | null;

  /** Unique identifier for the UI builder project. */
  uiBuilderProjectId: string;

  /** Indicates whether the project is assigned to all team members. */
  isAssignedToAllUsers?: boolean;

  /** Name of the UI builder project. */
  name?: string | null;

  /** Number of the newest generated version for the project. */
  headVersionNumber?: number;
}
