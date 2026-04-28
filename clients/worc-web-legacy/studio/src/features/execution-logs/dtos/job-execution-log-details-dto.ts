import { JobStatusTypesEnum } from "../enums/job-status-type-enum";

export interface JobExecutionLogDetailDto {
  id: string;
  name: string;

  flowId: string;
  flowVersionId: string;

  triggerType: string;
  refId: string | null;

  priority: string;
  status: JobStatusTypesEnum;

  versionNumber: number;

  reactFlowObject: string;
  flowVariablesObject:string;
  inputOutputObject: string;
  nodeExecutionLogs: string;

  type: string;
}
