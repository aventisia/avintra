/**
 * Represents a data transfer object (DTO) for job execution details.
 */
export interface JobTableDto {
  /**
   * Gets or sets the unique identifier for the job.
   */
  id?: string; // Corresponds to Guid in C#

  /**
   * Gets or sets the name of the flow or agent associated with the job.
   */
  name?: string;

  /**
   * Gets or sets the unique identifier for the flow or agent linked to the job.
   */
  flowVersionId: string; // Corresponds to Guid in C#

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
   * Gets or sets the timestamp when the job execution started.
   */
  startTime?: string; // Corresponds to DateTimeOffset in C#

  /**
   * Gets or sets the timestamp when the job execution finished. This is null if the job is still in progress.
   */
  endTime?: string; // Corresponds to DateTimeOffset in C#

  /**
   * Gets the job execution duration in seconds, calculated as the difference between StartTime and EndTime.
   * Returns 0 if the job is still running.
   */
  duration?: number;

  /**
   * Gets or sets the number of retries attempted for the job.
   */
  retryCount?: number;

  /**
   * Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
   */
  status?: string;

  /**
   * Gets or sets the execution logs associated with the job.
   * The logs may be stored as a string or JSON and contain details about the job's steps, errors, or results.
   */
  executionLogs?: string;

  /**
   * Gets or sets the unique identifier of the machine where the job is being executed.
   */
  machineId?: string; // Corresponds to Guid in C#
  osId?: string; // Corresponds to Guid in C#

  /**
   * Gets or sets the input arguments for the job, stored in JSON format.
   */
  inputArguments?: string;

  /**
   * Gets or sets the output arguments from the job, stored in JSON format.
   */
  nodeExecutionLogs?: string;

  /**
   * Gets or sets the timestamp indicating when the job record was created.
   */
  createdOn?: string; // Corresponds to DateTimeOffset in C#
}
