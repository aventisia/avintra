import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { Panel } from "@xyflow/react";
import { Eraser } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useRunResultsQueryParams } from "@/features/execute-flow/hooks/useRunResultsQueryParams";
import { useJobDataStore } from "@/features/execute-flow/stores/job-data-store";
import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { clearExecutionLogForVersion } from "@/features/execute-flow/utils/save-node-execution-log";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

const CANVAS_NODE_DETAIL_PANEL_ID = "canvas-node-detail";

export const ClearRunResultsPanel = () => {
  const { setShowRunResults, setJobId } = useRunResultsQueryParams();
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
    setCurrentFlow({ ...currentFlow, jobId: undefined });
    setShowRunResults(false);
    setJobId(undefined);
    closePanel(CANVAS_NODE_DETAIL_PANEL_ID);
    // Wipe persisted run results for this flow from IndexedDB so a refresh won't restore them.
    if (currentFlow.versionId) {
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
          className="flex items-center gap-2 shadow"
          onClick={handleClear}
        >
          <Eraser className="h-4 w-4" />
          Clear Results
        </Button>
      </Tooltip>
    </Panel>
  );
};

export { CANVAS_NODE_DETAIL_PANEL_ID };
