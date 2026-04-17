/**
 * DTO for execute flow API response
 */
export interface ExecuteFlowResponseDto {
  jobId?: string;
  flowVersionId?: string;
  outputDataJson?: string;
  jobStatus?: string;
}
