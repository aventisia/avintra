import { JobPriorityEnum, JobStatusEnum } from "..";

/**
 * DTO for updating job properties (Maps to backend JobUpdateDto — used for updating job status, priority, and remarks)
 */
export interface JobUpdateDto {
  /** The unique identifier of the job to be updated. */
  id: string;

  /** The new status of the job. */
  status?: JobStatusEnum;

  /** The new priority of the job. */
  priority?: JobPriorityEnum;

  /** Any remarks or comments related to the job update. */
  remarks?: string;
}
