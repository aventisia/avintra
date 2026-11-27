import { JobStatusEnum } from "@avplatform/ui/enums";

export interface JobExecutionLogDto {
  id: string;
  status: JobStatusEnum;

  startTime: Date | string;
  endTime: Date | string | null;
  duration: number; // in seconds

  flowVersionId: string;
  flowId: string;

  type: string;
  name: string;
  versionNumber: number;
}
