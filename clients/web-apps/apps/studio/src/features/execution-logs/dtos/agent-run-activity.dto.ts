export interface AgentRunActivityDayDto {
  /** Local calendar day as `yyyy-MM-dd`. */
  date: string;
  runs: number;
  succeeded: number;
  failed: number;
}

export interface AgentRunActivityDto {
  totalRuns: number;
  succeededRuns: number;
  failedRuns: number;
  /** Null when no run has completed in the window. */
  averageDurationSeconds: number | null;
  /** Oldest day first, ending on the current local day. */
  days: AgentRunActivityDayDto[];
}
