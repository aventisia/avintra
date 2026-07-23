/**
 * Represents a Data Transfer Object (DTO) for an on-prem tenant statistics
 */
export interface OnpremTenantStaticDto {
  totalExecutionTimeConsumed: number;
  totalUsers: number;
  totalPublishedAgents: number;
  totalExecutedJobs: number;
}
