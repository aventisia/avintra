import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const SHOW_RUN_RESULTS_PARAM = "showRunResults";
const JOB_ID_PARAM = "j";

export function useRunResultsQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const showRunResults = searchParams.get(SHOW_RUN_RESULTS_PARAM) === "1";
  const jobId = searchParams.get(JOB_ID_PARAM) || undefined;

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

  return {
    showRunResults,
    jobId,
    setShowRunResults,
    setJobId,
  };
}
