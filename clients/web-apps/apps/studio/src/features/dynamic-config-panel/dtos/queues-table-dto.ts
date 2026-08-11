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

  /**
   * Custom status configuration for the queue.
   * The core system statuses (Pending, InProgress, Completed, Failed) are implicit
   * and are not stored here; only queue-specific custom statuses are persisted.
   */
  statuses?: QueueStatusDefinition[] | null;
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

/**
 * Defines a custom disposition status for a queue, including its display color and
 * optional route queue. Disposition statuses are always terminal (end) states.
 */
export interface QueueStatusDefinition {
  /** Internal status value (e.g., "Approved", "Rejected"). */
  name: string;
  /** Display label shown to users. */
  label?: string | null;
  /** Color used to render the status badge (e.g., "#22c55e"). */
  color?: string | null;
  /** Name of the destination queue to route the work item to when this status is selected. */
  routeQueue?: string | null;
}
