export interface FlowSilentUpdateDto {
  id: string;
  versionId: string;
  thumbnail?: string | null;
  reactFlowObject: string;
  flowVariablesObject?: string | null;
  inputOutputObject?: string | null;
  supportedPlatform?: string | null;
}
