import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { QueueProcessingModeEnum } from "../enums/queue-processing-mode-enum";
import { QueueTypesEnum } from "../enums/queue-instance-type-enum";

/**
 * Represents a data transfer object (DTO) for a queue.
 */
export interface QueuesTableDto {
  /**
   * Gets or sets the unique identifier of the queue.
   */
  id: string;

  /**
   * Gets or sets the name of the queue.
   */
  name: string;

  /**
   * Gets or sets the type of the queue.
   */
  type?: QueueTypesEnum;

  /**
   * Gets or sets how work items in this queue are claimed for processing.
   */
  processingMode?: QueueProcessingModeEnum;

  /**
   * Gets or sets the list of destination queues
   * to which items can be routed.
   */
  routeToQueues?: string[] | null;

  /**
   * Gets or sets the description of the queue.
   */
  description?: string | null;

  /**
   * Whether the queue enforces unique references.
   */
  isUniqueReferencesEnforced: boolean;

  /**
   * Whether queue items are stored encrypted.
   */
  isStoredEncrypted: boolean;

  /**
   * Whether failed items should be retried.
   */
  shouldRetryFailedItems: boolean;

  /**
   * Whether abandoned items should be retried.
   */
  shouldRetryAbandonedItems: boolean;

  /**
   * Maximum number of retry attempts.
   */
  maximumRetryAttempts: number;

  /**
   * Input schema definition for the queue.
   */
  inputSchema?: InputSchemaField[] | null;

  /**
   * Output schema definition for the queue.
   */
  outputSchema?: string | null;

  /**
   * Custom status configuration for the queue.
   * The core system statuses (Pending, InProgress, Completed, Failed) are implicit
   * and are not stored here; only queue-specific custom statuses are persisted.
   */
  statuses?: QueueStatusDefinition[] | null;

  /**
   * Number of items currently in progress.
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
   * Names of the agents (flow versions) assigned to the queue.
   */
  agentsNames?: string[] | null;

  /**
   * Indicates whether the queue is accessible
   * to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Access level granted to the user.
   */
  accessLevel: ResourceAccessTypeEnum;

  credentialId?: string;

  /**
   * Name of the credential used to access resources associated with the queue.
   * The Agent Builder stores and submits the resource NAME; the backend resolves
   * it to the credentialId before persisting.
   */
  credentialName?: string;

  /**
   * Indicates whether the queue is disabled.
   */
  isDisabled?: boolean;

  /**
   * Username of the creator.
   */
  createdBy?: string;

  /**
   * Creation timestamp.
   */
  createdOn?: Date | string;

  /**
   * Username of the last modifier.
   */
  lastModifiedBy?: string;

  /**
   * Last modification timestamp.
   */
  lastModifiedOn?: Date | string;
}

export interface InputSchemaField {
  name: string;
  description: string;
  label: string | null;
  type: "string" | "int" | "Date" | "Array"; // Extend if more types exist
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
