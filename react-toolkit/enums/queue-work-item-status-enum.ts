/**
 * Represents the possible statuses for a queue transaction.
 *
 * @export
 * @enum {number}
 */
export enum QueueWorkItemStatusEnum {
  Pending = "Pending",
  InProgress = "InProgress",
  Completed = "Completed",
  Failed = "Failed",
}
