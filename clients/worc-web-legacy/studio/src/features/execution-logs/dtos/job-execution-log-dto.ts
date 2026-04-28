import { JobStatusTypesEnum } from "../enums/job-status-type-enum";

export interface JobExecutionLogDto {
  id: string;
  status: JobStatusTypesEnum;

  startTime: Date | string;
  endTime: Date | string;
  duration: number; // in seconds

  flowVersionId: string;
  flowId: string;

  type: string;
  name: string;
  versionNumber: number;
}
