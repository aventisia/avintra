import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

/**
 * Represents a data transfer object (DTO) for a queue.
 */
export interface QueuesTableDto {
  /**
   * Gets or sets the primary key of the queue record.
   */
  id: string;

  /**
   * Gets or sets the name of the queue.
   */
  name: string;

  /**
   * Gets or sets the name of the queue.
   */
  type?: string;
  /**
   * Gets or sets the description for the queue.
   */
  description: string;

  /**
   * Whether the queue enforces unique references.
   */
  isUniqueReferencesEnforced: boolean;

  /**
   * Whether the queue data is stored encrypted.
   */
  isStoredEncrypted: boolean;

  /**
   * Whether the queue should retry failed items.
   */
  shouldRetryFailedItems: boolean;

  /**
   * Whether the queue should retry abandoned items.
   */
  shouldRetryAbandonedItems: boolean;

  /**
   * Maximum number of retry attempts for a work item.
   */
  maximumRetryAttempts: number;

  /**
   * Access level of the configuration item.
   */
  accessLevel: ResourceAccessTypeEnum;

  /**
   * Indicates whether the kb is accessible
   * to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Whether the queue is disabled.
   */
  isDisabled: boolean;

  /**
   * Username of the user who created the queue.
   */
  createdBy: string;

  /**
   * Timestamp when the queue was created.
   */
  createdOn: string | Date;

  /**
   * Username of the user who last modified the queue.
   */
  lastModifiedBy: string;

  /**
   * Timestamp when the queue was last modified.
   */
  lastModifiedOn: string | Date;

  /**
   * Number of in-progress items.
   */
  inProgress: number;

  /**
   * Number of pending items.
   */
  pending: number;

  /**
   * Number of completed items.
   */
  completed: number;

  /**
   * Number of failed items.
   */
  failed: number;

  /**
   * Total number of items.
   */
  total: number;

  /**
   * Input schema definition for the queue.
   */
  inputSchema: InputSchemaField[];
}

/**
 * Represents a field in the input schema.
 */
export interface InputSchemaField {
  name: string;
  description: string;
  label: string | null;
  type: "string" | "int" | "Date"; // Extend if more types exist
  isRequired: boolean;
  isUsedForUniqueIdentifier: boolean;
}
