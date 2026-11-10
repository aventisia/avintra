import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { EraserIcon } from "@phosphor-icons/react";
import { Panel } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useRunResultsQueryParams } from "@/features/execute-flow/hooks/useRunResultsQueryParams";
import { useJobDataStore } from "@/features/execute-flow/stores/job-data-store";
import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { clearExecutionLogForVersion } from "@/features/execute-flow/utils/save-node-execution-log";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

const CANVAS_NODE_DETAIL_PANEL_ID = "canvas-node-detail";

export const ClearRunResultsPanel = () => {
  const { setRunContext } = useRunResultsQueryParams();
  const { resetLiveExecution, liveExecutionMap } = useLiveExecutionStore(
    useShallow((state) => ({
      resetLiveExecution: state.resetLiveExecution,
      liveExecutionMap: state.liveExecutionMap,
    })),
  );
  const { executionState, currentFlow, setCurrentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      executionState: state.executionState,
      currentFlow: state.currentFlow,
      setCurrentFlow: state.setCurrentFlow,
    })),
  );
  const { resetJob } = useJobDataStore(
    useShallow((state) => ({
      resetJob: state.resetJob,
    })),
  );
  const { closePanel } = usePanelStore(
    useShallow((state) => ({
      closePanel: state.closePanel,
    })),
  );

  const hasResults = Object.keys(liveExecutionMap).length > 0;
  const isFinished = executionState === "stopped";
  const visible = isFinished && hasResults;

  const handleClear = () => {
    resetLiveExecution();
    resetJob();
    setCurrentFlow({
      ...currentFlow,
      jobId: undefined,
      runVersionId: undefined,
      runFlowId: undefined,
    });
    // Clear the whole run context atomically (job id, run version, run flow and
    // show-run-results flag) so no stale param is left behind in the URL.
    setRunContext({
      jobId: undefined,
      runVersionId: undefined,
      runFlowId: undefined,
      showRunResults: false,
    });
    closePanel(CANVAS_NODE_DETAIL_PANEL_ID);
    // Wipe persisted run results for this flow from IndexedDB so a refresh won't restore them.
    // When inside a sub-flow, logs live under the ROOT run version (`runVersionId`), so we
    // clear that entry (and the sub-flow's own version) to fully reset the run.
    const logVersionId = currentFlow.runVersionId || currentFlow.versionId;
    if (logVersionId) {
      void clearExecutionLogForVersion(logVersionId);
    }
    if (currentFlow.versionId && currentFlow.versionId !== logVersionId) {
      void clearExecutionLogForVersion(currentFlow.versionId);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Panel position="top-center">
      <Tooltip content="Clear execution results">
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 shadow-pop"
          onClick={handleClear}
        >
          <EraserIcon className="h-4 w-4" />
          Clear results
        </Button>
      </Tooltip>
    </Panel>
  );
};

export { CANVAS_NODE_DETAIL_PANEL_ID };
