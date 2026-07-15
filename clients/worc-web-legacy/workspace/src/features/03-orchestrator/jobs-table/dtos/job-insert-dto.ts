import { JobPriorityEnum, TriggerTypesEnum } from "..";

export interface JobInsertDto {
  /** The unique identifier for the flow version linked to the job. */
  flowVersionId: string;

  /** The trigger type for the job. */
  triggerType: TriggerTypesEnum;

  /** The priority level of the job. */
  priority: JobPriorityEnum;

  /** The name of the user or trigger that created the job. */
  createdByName: string;

  /** The unique identifier of the user or trigger that created the job. */
  createdById: string;

  /** The environment or platform where the job is executed. */
  executionLocation: string;

  /** The input payload for the job in JSON format. */
  jobInputData?: Record<string, unknown>;

  /** Optional job id to create the job with retryCount > 0. 
   * If provided, the job id will remain the same but retry count > 0. Also, jobId should exist in the database for the same flowVersionId.
   * If not provided, a new job id will be generated and retry count will be 0.
   */
  jobId?: string;
}
