export interface FlowVersionHistoryDetailDto {
  id: string;
  flowVersionId: string;
  versionNumber: number;

  reactFlowObject?: string | null; // raw JSON string
  flowVariablesObject?: string | null; // raw JSON string
  inputOutputObject?: string | null; // raw JSON string

  flowId: string;
  flowName?: string | null;

  createdBy?: string | null;
  createdByUsername?: string | null;
  createdOn: string;
  createdByUserInitials?: string | null;
}
