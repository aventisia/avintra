import { JobStatusEnum } from "../enums/job-status-enum";

export interface JobExecutionLogDto {
  id: string;
  status: JobStatusEnum;

  startTime: Date | string;
  endTime: Date | string;
  duration: number; // in seconds

  flowVersionId: string;
  flowId: string;

  type: string;
  name: string;
  versionNumber: number;
}
