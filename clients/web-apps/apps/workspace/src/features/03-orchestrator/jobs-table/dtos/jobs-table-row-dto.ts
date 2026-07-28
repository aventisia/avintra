import { JobPriorityEnum, JobStatusEnum, TriggerTypesEnum } from "..";

/**
 * Represents a single row in the jobs table, providing a summary of job record for display purposes (maps to backend JobsTableRowDto).
 * NOTE: Same dto is being used for CSV export of jobs data.
 */
export interface JobsTableRowDto {
  /** The unique identifier for the job. */
  id: string;

  /** The name of the flow associated with the job. */
  flowName: string;

  /**
   * The version of the flow associated with the job.
   * NOTE: Keeping it string to support versioning like 1.0.0, 1.0.1, 1.1.0 etc. in future.
   */
  flowVersionNumber: string;

  /** The status of the job. */
  status: JobStatusEnum;

  /** The unique identifier for the flow version linked to the job. */
  flowVersionId: string;

  /** Indicates whether the flow version is published. */
  isFlowVersionPublished: boolean;

  /** The trigger type for the job. */
  triggerType: TriggerTypesEnum;

  /** The priority level of the job. */
  priority: JobPriorityEnum;

  /** The number of retries attempted for the job. */
  retryCount: number;

  /** The name of the user or trigger that created the job. */
  createdByName: string;

  /** The timestamp indicating when the job record was created. */
  createdAt: string;

  /** The environment or platform where the job is executed. */
  executionLocation: string;

  /** Remarks or additional information related to the job execution or status. */
  remarks?: string;

  /** The timestamp indicating when the job execution started. */
  startTimeStamp?: string;

  /** The timestamp indicating when the job execution completed. */
  endTimeStamp?: string;

  /** The job execution duration in seconds. */
  duration: number;

  /** The total credits consumed for the job execution. Set when the job reaches a terminal state. */
  creditsConsumed?: number;
}
