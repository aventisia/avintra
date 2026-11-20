import { JobPriorityEnum, TriggerTypesEnum } from "..";

export interface JobInsertDto {
  /** The unique identifier for the flow version linked to the job. */
  flowVersionId: string;

  /** The trigger type for the job. */
  triggerType?: TriggerTypesEnum;

  /** The priority level of the job. */
  priority?: JobPriorityEnum;

  /** The environment or platform where the job is executed. */
  executionLocation?: string;

  /** The input payload for the job in JSON format. */
  jobInputData?: Record<string, unknown>;

  /** Optional job id of any attempt in an existing retry chain.
   * If provided, a new attempt is created with a fresh job id, numbered one above the chain's latest attempt; the latest attempt must be terminal or the request fails with 409.
   * The retry inherits the chain's trigger type and parent reference; any trigger type in this payload applies to fresh jobs only.
   * If not provided, a new job id is generated and retry count is 0.
   */
  existingJobId?: string;
}
