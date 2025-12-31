/**
 * Represents the possible statuses for a queue transaction.
 *
 * @export
 * @enum {number}
 */
export enum QueueWorkItemStatusEnum {
  Pending = "Pending",
  InProgress = "In Progress",
  Completed = "Completed",
  Failed = "Failed",
}
