/**
 * Represents a data transfer object (DTO) for a custom UI builder project.
 */
export interface UiBuilderProjectDto {
  /**
   * Gets or sets the primary key of the project record.
   */
  id?: string;

  /**
   * Gets or sets the name of the project. Max-255
   */
  name: string;

  /**
   * Gets or sets the description of the project. Max-500
   */
  description?: string;

  /**
   * Indicates whether the project is accessible to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Gets the number of generated versions stored for the project.
   */
  versionCount?: number;

  /**
   * Gets or sets the username of the user who created the project record.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the project record was created.
   */
  createdOn?: string;
}

/**
 * Represents a data transfer object (DTO) for a generated custom UI builder version.
 */
export interface UiBuilderVersionDto {
  /**
   * Gets or sets the primary key of the version record.
   */
  id?: string;

  /**
   * Gets or sets the ID of the project this version belongs to.
   */
  uiBuilderProjectId: string;

  /**
   * Gets or sets the sequential version number within the project.
   */
  versionNumber: number;

  /**
   * Gets or sets the prompt that produced this version.
   */
  promptText: string;

  /**
   * Gets or sets the full standalone HTML document generated for this version.
   */
  generatedHtml: string;

  /**
   * Gets or sets the wire provider used for generation.
   */
  provider: string;

  /**
   * Gets or sets the model used for generation.
   */
  model: string;

  /**
   * Gets or sets the username of the user who created the version record.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the version record was created.
   */
  createdOn?: string;
}

/** Payload used to persist a newly generated version. */
export type CreateUiBuilderVersionPayload = Pick<
  UiBuilderVersionDto,
  "promptText" | "generatedHtml" | "provider" | "model"
>;
