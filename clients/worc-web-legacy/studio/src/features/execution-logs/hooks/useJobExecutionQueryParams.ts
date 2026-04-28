import { useSearchParams } from "react-router-dom";

export function useJobExecutionQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const flowId = searchParams.get("f");
  const versionId = searchParams.get("v");
  const jobId = searchParams.get("j");

  const setJobId = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("j", id);
    setSearchParams(params, { replace: true });
  };

  return {
    flowId,
    versionId,
    jobId,
    setJobId,
  };
}
