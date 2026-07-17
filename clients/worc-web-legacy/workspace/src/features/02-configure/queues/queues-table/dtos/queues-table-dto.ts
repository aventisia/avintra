import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { QueueTypesEnum } from "../enums/queue-instance-type-enum";
import { QueueViewTypeEnum } from "../enums/queue-view-type-enum";

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
   * Gets or sets the view type of the queue.
   */
  viewType?: QueueViewTypeEnum;

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
  type: "string" | "int" | "Date"; // Extend if more types exist
  isRequired: boolean;
  isUsedForUniqueIdentifier: boolean;
}
