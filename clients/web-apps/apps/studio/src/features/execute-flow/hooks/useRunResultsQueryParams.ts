import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const SHOW_RUN_RESULTS_PARAM = "showRunResults";
const JOB_ID_PARAM = "j";
/** The root flow version id that owns the current local run's logs. */
const RUN_VERSION_ID_PARAM = "rv";
/** The root flow id of the current local run (`f`/`v` always describe the current flow). */
const RUN_FLOW_ID_PARAM = "rf";

export function useRunResultsQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const showRunResults = searchParams.get(SHOW_RUN_RESULTS_PARAM) === "1";
  const jobId = searchParams.get(JOB_ID_PARAM) || undefined;
  const runVersionId = searchParams.get(RUN_VERSION_ID_PARAM) || undefined;
  const runFlowId = searchParams.get(RUN_FLOW_ID_PARAM) || undefined;

  const setShowRunResults = useCallback(
    (value: boolean) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(SHOW_RUN_RESULTS_PARAM, "1");
      } else {
        params.delete(SHOW_RUN_RESULTS_PARAM);
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setJobId = useCallback(
    (id: string | undefined) => {
      const params = new URLSearchParams(searchParams);
      if (id) {
        params.set(JOB_ID_PARAM, id);
      } else {
        params.delete(JOB_ID_PARAM);
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setRunVersionId = useCallback(
    (id: string | undefined) => {
      const params = new URLSearchParams(searchParams);
      if (id) {
        params.set(RUN_VERSION_ID_PARAM, id);
      } else {
        params.delete(RUN_VERSION_ID_PARAM);
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setRunFlowId = useCallback(
    (id: string | undefined) => {
      const params = new URLSearchParams(searchParams);
      if (id) {
        params.set(RUN_FLOW_ID_PARAM, id);
      } else {
        params.delete(RUN_FLOW_ID_PARAM);
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  /**
   * Sets the whole run context (job id + root run version + root flow id + show-run-results
   * flag) in a single `setSearchParams` call. Setting them separately is racy: each setter
   * rebuilds from the same stale `searchParams` closure, so the later calls would drop the
   * params written by the earlier ones. This is used when a local run starts so the run
   * context is present in the URL immediately (not only after completion), letting sub-flow
   * navigation retain the live execution log.
   */
  const setRunContext = useCallback(
    (context: {
      jobId?: string;
      runVersionId?: string;
      runFlowId?: string;
      showRunResults?: boolean;
    }) => {
      const params = new URLSearchParams(searchParams);
      if (context.jobId) {
        params.set(JOB_ID_PARAM, context.jobId);
      } else {
        params.delete(JOB_ID_PARAM);
      }
      if (context.runVersionId) {
        params.set(RUN_VERSION_ID_PARAM, context.runVersionId);
      } else {
        params.delete(RUN_VERSION_ID_PARAM);
      }
      if (context.runFlowId) {
        params.set(RUN_FLOW_ID_PARAM, context.runFlowId);
      } else {
        params.delete(RUN_FLOW_ID_PARAM);
      }
      if (context.showRunResults) {
        params.set(SHOW_RUN_RESULTS_PARAM, "1");
      } else {
        params.delete(SHOW_RUN_RESULTS_PARAM);
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return {
    showRunResults,
    jobId,
    runVersionId,
    runFlowId,
    setShowRunResults,
    setJobId,
    setRunVersionId,
    setRunFlowId,
    setRunContext,
  };
}
