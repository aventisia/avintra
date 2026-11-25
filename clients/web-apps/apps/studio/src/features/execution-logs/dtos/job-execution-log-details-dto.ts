import { JobStatusEnum } from "@avplatform/ui/enums";

export interface JobExecutionLogDetailDto {
  id: string;
  name: string;

  flowId: string;
  flowVersionId: string;

  triggerType: string;
  refId: string | null;

  priority: string;
  startTime: string | null;
  endTime: string | null;
  status: JobStatusEnum;
  remark: string | null;

  versionNumber: number;

  reactFlowObject: string;
  flowVariablesObject: string;
  inputOutputObject: string;
  nodeExecutionLogs: unknown[];

  type: string;
}
