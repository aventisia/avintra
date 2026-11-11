export interface FetchParentFlowDto {
  flowId: string;
  versionId: string;
  flowName: string;
  reactFlowObject?: string | null;
  inputOutputObject?: string | null;
}
