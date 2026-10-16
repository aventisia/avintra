/**
 * Represents a published custom UI builder project assigned to the current user.
 */
export interface MyInterfaceDto {
  /** Gets or sets the primary key of the project record. */
  id: string;

  /** Gets or sets the name of the project. Max-255 */
  name: string;

  /** Gets or sets the description of the project. Max-500 */
  description?: string;

  /** Indicates whether the published project is visible to all users within the tenant. */
  isPublishedTenantWide?: boolean;

  /** Gets the number of generated versions stored for the project. */
  versionCount?: number;

  /** Gets the number of the newest generated version for the project. */
  headVersionNumber?: number;

  /** Gets the pinned published version number shown to assigned users. */
  publishedVersionNumber?: number;

  /** Gets or sets the username of the user who created the project record. */
  createdBy?: string | null;

  /** Gets or sets the date and time when the project record was created. */
  createdOn?: Date;

  /** Gets or sets the display type label for the interface. */
  type?: string;
}

/**
 * Represents a generated UI builder version rendered read-only in Assist.
 */
export interface MyInterfaceVersionDto {
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
export interface MyInterfaceViewDto {
  /** Gets or sets the published project details. */
  project?: MyInterfaceDto | null;

  /** Gets or sets the pinned published version, or null when the project has no published version. */
  headVersion?: MyInterfaceVersionDto | null;
}
