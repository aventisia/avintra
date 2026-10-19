import { type UiBuilderDataConnection } from "@avplatform/ui/ui-builder-host";

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
   * Indicates whether the project has been published.
   */
  isPublished: boolean;

  /**
   * Gets the number of generated versions stored for the project.
   */
  versionCount?: number;

  /**
   * Gets the number of the newest generated version for the project.
   */
  headVersionNumber?: number;

  /**
   * Gets the pinned published version number, or null when the project is not published.
   */
  publishedVersionNumber?: number;

  /**
   * Gets or sets the permission level granted to the user.
   */
  accessLevel: string;

  /**
   * Gets the data sources the project's generated interface may read and write.
   */
  dataConnections?: UiBuilderDataConnection[];

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
   * Gets or sets the output format marker for this version ("html" or "framework").
   */
  contentFormat: string;

  /**
   * Gets or sets the JSX source artifact for framework versions, or null for html versions.
   */
  sourceArtifact?: string | null;

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
  "promptText" | "generatedHtml" | "contentFormat" | "sourceArtifact" | "provider" | "model"
>;

/** A tenant-enabled Text model the builder can generate with. */
export interface UiBuilderModelDto {
  /** Tenant model provider type, e.g. "OpenAI", "Gemini", or a LiteLLM provider such as "azure". */
  providerType: string;

  /** Raw model id as enabled in Tenant Admin > Models. */
  modelId: string;

  /** Vault credential configured for the provider, or null when it runs on platform credits. */
  credentialName?: string | null;

  /** Environment ("dev" or "prod") the vault credential belongs to. */
  credentialEnvType?: string | null;

  /** Custom endpoint configured for the provider (for example Ollama). */
  providerUrl?: string | null;
}

/** A field in a queue work item schema. */
export interface UiBuilderQueueSchemaField {
  name: string;
  label: string | null;
  description: string;
  type: "string" | "int" | "Date" | "Array";
  isRequired: boolean;
  isUsedForUniqueIdentifier: boolean;
}

/** The subset of a queue the builder reads and creates. */
export interface UiBuilderQueueDto {
  id?: string;
  name: string;
  description?: string | null;
  type?: "Agent" | "User";
  processingMode?: "Fifo" | "Manual";
  isUniqueReferencesEnforced: boolean;
  isStoredEncrypted: boolean;
  shouldRetryFailedItems: boolean;
  shouldRetryAbandonedItems: boolean;
  maximumRetryAttempts: number;
  inputSchema?: UiBuilderQueueSchemaField[] | null;
  statuses?: { name: string; label?: string | null; color?: string | null }[] | null;
  isTenantWideAccess: boolean;
  total?: number;
  pending?: number;
}
