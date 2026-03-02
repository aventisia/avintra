import { useSearchParams } from "react-router-dom";

export function useVersionHistoryQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const flowId = searchParams.get("f");
  const versionId = searchParams.get("v");
  const historyId = searchParams.get("h");

  const setHistoryId = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("h", id);
    setSearchParams(params, { replace: true });
  };

  return {
    flowId,
    versionId,
    historyId,
    setHistoryId,
  };
}
