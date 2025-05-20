/**
 * Enum representing the types of status of the job execution.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file and
 * also we need to update existing machines in the database.
 */
export enum ExecutionStatusTypesEnum {
  Running = "Running",
  Completed = "Completed",
  Failed = "Failed",
  Canceled = "Canceled",
}
