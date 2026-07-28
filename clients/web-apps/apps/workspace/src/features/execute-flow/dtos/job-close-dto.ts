import { JobStatusEnum } from "@/features/03-orchestrator/jobs-table/enums/job-status-enum";

/** Payload to close a job in a terminal status. */
export interface JobCloseDto {
  /** The unique identifier of the job to close. */
  id: string;

  /** The terminal closing status of the job. */
  closingStatus: JobStatusEnum;

  /** The node execution logs as a JSON string. */
  nodeExecutionLogs?: string;

  /** Optional remarks related to the job closure. */
  remarks?: string;
}
