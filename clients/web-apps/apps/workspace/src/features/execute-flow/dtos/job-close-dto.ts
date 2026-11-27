import { JobStatusEnum } from "@avplatform/ui/enums";

import { NodeExecutionLogDto } from "./node-execution-log.dto";

/** Payload to close a job in a terminal status. */
export interface JobCloseDto {
  /** The unique identifier of the job to close. */
  id: string;

  /** The terminal closing status of the job. */
  closingStatus: JobStatusEnum;

  /** The node execution logs for the job. */
  nodeExecutionLogs?: NodeExecutionLogDto[];

  /** Optional remarks related to the job closure. */
  remarks?: string;
}
