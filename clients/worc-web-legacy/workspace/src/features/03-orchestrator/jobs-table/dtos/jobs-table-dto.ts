import { JobStatusEnum } from "../enums/job-status-enum";

/**
 * Represents a data transfer object (DTO) for a jobs.
 */
export interface JobsTableDto {
  /**
   * Gets or sets the primary key of the execution record.
   *
   * Not making it required because the same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the tenantId.
   *
   * Not making it required because the same DTO is used for insert and update.
   */
  tenantId?: string;

  /**
   * Gets or sets the flowVersionId.
   *
   * Not making it required because the same DTO is used for insert and update.
   */
  flowVersionId?: string;

  versionNumber?: number;

  /**
   * Gets or sets the name of the execution. Max-255
   */
  name: string;

  isPublished?: boolean;

  /**
   * Gets or sets the number of retry counts in the execution.
   */
  retryCount?: number;

  /**
   * Gets or sets the status of the execution.
   */
  status: JobStatusEnum;

  /**
   * Gets or sets the last update time of the execution.
   */
  endTime: Date;

  /**
   * Gets or sets the start time of the execution.
   */
  startTime: Date;

  /**
   * Gets or sets the duration of the execution in seconds (number format).
   */
  duration: number;

  /**
   * Gets or sets the version number.
   */
  version: number;

  /**
   * Gets or sets a flag indicating whether the execution record is disabled.
   *
   * Not making it required because the same DTO is used for insert and update.
   *
   * Important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the execution record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the execution record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the execution record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the execution record was last modified.
   */
  lastModifiedOn?: Date;

  /**
   * Gets or sets the error message (if any) related to the execution.
   */
  errorMessage?: string;

  /**
   * Gets or sets the flow ID associated with the execution.
   */
  flowId?: string;

  /**
   * Gets or sets the username of the user who executed the execution. Max-254
   */
  executedBy?: string;

  /**
   * Gets or sets the where the flow was executed.
   */
  executedOn?: string;

  /**
   * Gets or sets the type of execution (e.g., Scheduler).
   */
  executionType?: string;

  /**
   * Gets or sets the logs related to the action execution. Can be null.
   */
  actionExecutionLogs?: string | null; // Could be null, empty, or a string

  /**
   * Gets or sets the trigger type for the job (e.g., manual, API, event-based).
   */
  triggerType?: string;

  /**
   * Gets or sets the identifier of the trigger that initiated the job. This is optional and may be null.
   */
  refId?: string; // Corresponds to Guid in C#

  /**
   * Gets or sets the priority level of the job (e.g., Normal, High).
   */
  priority?: string;

  /**
   * Gets or sets the execution logs associated with the job.
   * The logs may be stored as a string or JSON and contain details about the job's steps, errors, or results.
   */
  executionLogs?: string;

  /**
   * Gets or sets the unique identifier of the machine where the job is being executed.
   */
  machineId?: string; // Corresponds to Guid in C#

  /**
   * Gets or sets the input arguments for the job, stored in JSON format.
   */
  inputArguments?: string;

  /**
   * Gets or sets the output arguments from the job, stored in JSON format.
   */
  outputArguments?: string;
}
