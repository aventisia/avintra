import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const SHOW_RUN_RESULTS_PARAM = "showRunResults";
const JOB_ID_PARAM = "j";
/** The root flow version id that owns the current local run's logs. */
const RUN_VERSION_ID_PARAM = "rv";

export function useRunResultsQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const showRunResults = searchParams.get(SHOW_RUN_RESULTS_PARAM) === "1";
  const jobId = searchParams.get(JOB_ID_PARAM) || undefined;
  const runVersionId = searchParams.get(RUN_VERSION_ID_PARAM) || undefined;

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

  return {
    showRunResults,
    jobId,
    runVersionId,
    setShowRunResults,
    setJobId,
    setRunVersionId,
  };
}
