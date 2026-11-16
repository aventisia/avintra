/** Code-split Studio views, shared by their pages and by the view switch that preloads them. */
export const loadExecutionLogsView = () =>
  import("@/features/execution-logs/components/ReactFlowViewOnly");

export const loadAgentHistoryView = () =>
  import("@/features/version-history/components/ReactFlowViewOnly");
