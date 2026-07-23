import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";

import { JobPriorityEnum, JobStatusEnum, TriggerTypesEnum } from "..";

/**
 * DTO for getting job record details (Maps to backend JobRecordDto — full job details)
 */
export interface JobRecordDto {
  /** The unique identifier for the job. */
  id: string;

  /** The name of the flow associated with the job. */
  flowName: string;

  /**
   * The version of the flow associated with the job.
   * NOTE: Keeping it string to support versioning like 1.0.0, 1.0.1, 1.1.0 etc. in future.
   */
  flowVersionNumber: string;

  /** The type of the flow associated with the job. */
  flowType: FlowTypesEnum;

  /** The status of the job. */
  status: JobStatusEnum;

  /** The unique identifier for the flow version linked to the job. */
  flowVersionId: string;

  /** The FlowVersionHistoryId associated with this job. */
  flowVersionHistoryId: string;

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

  /** The unique identifier of the user or trigger that created the job. */
  createdById: string;

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

  /** The input payload for the job in JSON format. */
  jobInputData?: Record<string, unknown>;

  /** The output payload for the job in JSON format. */
  jobOutputData?: Record<string, unknown>;

  /** Execution log of the last executed node if job fails or is aborted. */
  lastNodeLog?: Record<string, unknown>;
}
