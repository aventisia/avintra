import { QueueTransactionEventEnum } from "../enums/queue-transaction-event-enum";

/**
 * Represents an event associated with a queue transaction.
 */
export interface QueueTransactionEventDto {
  /**
   * Unique identifier of the queue transaction event.
   */
  id: string;

  /**
   * Type of event that occurred for the queue transaction.
   */
  eventType: QueueTransactionEventEnum;

  /**
   * Event payload data.
   */
  data: string;

  /**
   * Unique identifier of the associated queue transaction.
   */
  queueTransactionId: string;

  /**
   * Name of the user who created the event.
   */
  createdBy?: string | null;

  /**
   * Date and time when the event was created.
   */
  createdOn: Date | string;

  /**
   * Date and time when the event was last modified.
   */
  lastModifiedOn?: Date | string | null;
}
