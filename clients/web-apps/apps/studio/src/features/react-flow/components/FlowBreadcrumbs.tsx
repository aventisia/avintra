import { Panel } from "@xyflow/react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { Breadcrumb, useBreadcrumbStore } from "@/stores/breadcrumb-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowViewStore } from "@/stores/react-flow-view-store";

export const FlowBreadcrumbs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { trail, sliceBreadcrumb } = useBreadcrumbStore();

  const currentFlow = useCurrentFlowStore((state) => state.currentFlow);
  const name = useReactFlowViewStore(useShallow((state) => state.name));

  const isExecutionLog = useIsExecutionLogsRoute();

  if (trail.length === 0) return null;

  const handleCrumbClick = (crumb: Breadcrumb, index: number) => {
    const params = new URLSearchParams();
    if (crumb.flowId) params.set("f", crumb.flowId);
    if (crumb.versionId) params.set("v", crumb.versionId);
    if (crumb.jobId) params.set("j", crumb.jobId); // Preserve job execution context
    if (crumb.runVersionId) params.set("rv", crumb.runVersionId); // Preserve run-log owner version
    if (crumb.runFlowId) params.set("rf", crumb.runFlowId); // Preserve run-log owner flow
    // Preserve the run-results flag so returning to a parent flow keeps the execution-log
    // panel alive. Without this, `showRunResults` is dropped and the panel + per-node logs
    // stop rendering even though the colored node borders remain (those live in the store).
    if (searchParams.get("showRunResults") === "1") {
      params.set("showRunResults", "1");
    }

    setSearchParams(params);
    sliceBreadcrumb(index);
  };

  // On the execution-log page `currentFlow` is stale (it still holds the flow the user came
  // from in the design canvas), so it must not be used here — it would render the parent
  // flow's name as the active crumb, duplicating the last trail entry. The view store's
  // `name` is set from the job detail / sub-flow graph and is the correct source there.
  const activeFlowName = isExecutionLog
    ? name || "Unknown Flow"
    : currentFlow?.name || name || "Unknown Flow";

  return (
    <Panel position="top-left">
      <div className="flex items-center gap-2 bg-white py-1 px-2 rounded-md shadow-md border border-slate-200">
        {trail.map((crumb, index) => (
          <div
            key={`${crumb.flowId}-${crumb.versionId || ""}-${crumb.jobId || index}`}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => handleCrumbClick(crumb, index)}
              className="text-xs font-medium text-slate-500 hover:text-primary transition-colors"
            >
              {crumb.name}
            </button>
            <span className="text-slate-400">/</span>
          </div>
        ))}
        <span className="text-xs font-bold text-slate-800">{activeFlowName}</span>
      </div>
    </Panel>
  );
};
