import { JobPriorityEnum, JobStatusEnum } from "..";

/**
 * DTO for updating job properties (Maps to backend JobUpdateDto — used for updating job priority, closing status, and remarks)
 */
export interface JobUpdateDto {
  /** The unique identifier of the job to be updated. */
  id: string;

  /** The new closing status of the job. Only terminal statuses are allowed. */
  closingStatus?: JobStatusEnum;

  /** The new priority of the job. */
  priority?: JobPriorityEnum;

  /** Any remarks or comments related to the job update. */
  remarks?: string;
}
