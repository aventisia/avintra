import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { getLiveNodeLog } from "@/features/execute-flow/utils/live-loop-index";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";

export type NodeRunState = "idle" | "running" | "success" | "failed";

/** Run state of a node: execution log on the logs route, live run status on the canvas. */
export const useNodeRunState = (nodeId: string, isDisabled = false): NodeRunState => {
  const isExecutionLog = useIsExecutionLogsRoute();
  const [searchParams] = useSearchParams();
  const subflowCallerId = searchParams.get("ci") || "";

  const logSuccess = useExecutionStore((state) => {
    const parents = state.nodeToParentStack[nodeId] || [];
    const pathKey = parents.map((id) => state.activeIteration[id] ?? 0).join("-") || "global";
    return state.executionMap[nodeId]?.[pathKey]?.isSuccess;
  });

  // Disabled nodes are not executed, so suppress any live status still broadcast for them.
  const liveStatus = useLiveExecutionStore((state) =>
    isDisabled ? undefined : state.liveExecutionMap[nodeId],
  );
  const { liveActiveIteration, liveLoopIndex } = useLiveExecutionStore(
    useShallow((state) => ({
      liveActiveIteration: state.liveActiveIteration,
      liveLoopIndex: state.liveLoopIndex,
    })),
  );

  if (isExecutionLog) {
    if (logSuccess === true) return "success";
    if (logSuccess === false) return "failed";
    return "idle";
  }

  const liveNodeLog = getLiveNodeLog(liveLoopIndex, subflowCallerId, nodeId, liveActiveIteration);
  return (liveNodeLog && liveStatus) || "idle";
};
