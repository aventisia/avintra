import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { useFetchFlowVersions } from "../hooks/useFetchFlowVersions";
import { useFlowsVersionsStore } from "../stores/flow-versions-store";
import { AgentDetailsTrigger } from "./AgentDetailsTrigger";
import { AgentDetailsPanel } from "./agent-details-panel/AgentDetailsPanel";

export const FlowVersions = () => {
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const flowId = queryParams.get("f");

  const versionId = queryParams.get("v") || undefined;

  const { data, isLoading } = useFetchFlowVersions(flowId || "");

  const setVersion = useFlowsVersionsStore((state) => state.setVersion);

  //Set initial version to view as draft
  useEffect(() => {
    if (data?.data) {
      let selectedVersion = data?.data[0]; // default to first item
      if (versionId) {
        const matched = data?.data.find((v) => v.id === versionId);
        if (matched) {
          selectedVersion = matched;
        }
      }
      try {
        setVersion(selectedVersion.id || "", selectedVersion.versionNumber || null);
      } catch {
        throw new Error("You don't have access to this agent. Please contact the admin.");
      }
    }
  }, [data?.data, versionId, setVersion]);

  return (
    <>
      <AgentDetailsTrigger />
      <AgentDetailsPanel versions={data?.data} isLoading={isLoading} />
    </>
  );
};
