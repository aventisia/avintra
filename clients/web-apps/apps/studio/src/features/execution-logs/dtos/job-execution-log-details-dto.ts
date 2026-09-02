import { JobStatusEnum } from "../enums/job-status-enum";

export interface JobExecutionLogDetailDto {
  id: string;
  name: string;

  flowId: string;
  flowVersionId: string;

  triggerType: string;
  refId: string | null;

  priority: string;
  status: JobStatusEnum;

  versionNumber: number;

  reactFlowObject: string;
  flowVariablesObject: string;
  inputOutputObject: string;
  nodeExecutionLogs: unknown[];

  type: string;
}
