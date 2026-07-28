/**
 * DTO for api request to execute the flow
 */
export interface ExecuteFlowRequestDto {
  flowVersionId: string;
  InputArgumentsJson?: string;
}
