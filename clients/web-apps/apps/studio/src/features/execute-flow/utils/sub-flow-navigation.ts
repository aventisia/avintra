/**
 * Builds the URL search params used to navigate into a sub-flow (block/call-agent) node.
 *
 * Besides the sub-flow's own `f`/`v`, we deliberately preserve the *run context* of the
 * parent run the user came from, so the design canvas can keep showing execution logs for
 * the sub-flow's nodes:
 *
 * - `showRunResults` — keeps the run-results panel/flag alive inside the sub-flow.
 * - `j` (jobId) — the job that produced the run; keeps the local WebSocket subscribed and
 *   lets `currentFlow.jobId` be restored so the WS cleanup does not wipe the live maps.
 * - `rv` (runVersionId) — the root flow version that owns the persisted logs. Sub-flow node
 *   logs are stored under the root version (the engine logs every node under the job's flow
 *   version), so the panel must restore against `rv`, not the sub-flow's own `v`.
 * - `rf` (runFlowId) — the root flow id. `f`/`v` always describe the *current* (sub-)flow,
 *   so the root flow id would otherwise be lost on navigation.
 *
 * The read-only execution-log view already passes `j`; this helper normalises the same
 * behaviour for the design canvas so sub-flow logs appear in both places.
 */
export const buildSubFlowNavigationParams = (params: {
  targetFlowId: string;
  targetVersionId: string;
  showRunResults?: boolean;
  jobId?: string;
  runVersionId?: string;
  runFlowId?: string;
  /**
   * The caller node (block/callAgent) being entered. Persisted as `ci` so the execution-log
   * view can scope the sub-flow's logs to this invocation and restore it on refresh.
   */
  callerId?: string;
}): Record<string, string> => {
  const nextParams: Record<string, string> = {
    f: params.targetFlowId,
    v: params.targetVersionId,
  };

  if (params.jobId) {
    nextParams.j = params.jobId;
  }
  if (params.runVersionId) {
    nextParams.rv = params.runVersionId;
  }
  if (params.runFlowId) {
    nextParams.rf = params.runFlowId;
  }
  if (params.callerId) {
    nextParams.ci = params.callerId;
  }
  if (params.showRunResults) {
    nextParams.showRunResults = "1";
  }

  return nextParams;
};
