import { JobStatusEnum } from "@avplatform/ui/enums";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { getLiveNodeLog } from "@/features/execute-flow/utils/live-loop-index";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";

export type NodeRunState =
  "idle" | "running" | "success" | "failed" | "killed" | "aborted" | "not-reached";

// Only a run that stopped on an error can paint a stopped step or a not-reached step; a
// completed run leaves unlogged nodes looking unstarted.
const stoppedRunState: Partial<Record<JobStatusEnum, NodeRunState>> = {
  [JobStatusEnum.Killed]: "killed",
  [JobStatusEnum.Aborted]: "aborted",
  [JobStatusEnum.Failed]: "failed",
};

/** Run state of a node: execution log on the logs route, live run status on the canvas. */
export const useNodeRunState = (nodeId: string, isDisabled = false): NodeRunState => {
  const isExecutionLog = useIsExecutionLogsRoute();
  const [searchParams] = useSearchParams();
  const subflowCallerId = searchParams.get("ci") || "";

  const { logIsSuccess, isStoppedStep, stoppedState } = useExecutionStore(
    useShallow((state) => {
      const parents = state.nodeToParentStack[nodeId] || [];
      const pathKey = parents.map((id) => state.activeIteration[id] ?? 0).join("-") || "global";
      const stoppedState = state.runStatus ? stoppedRunState[state.runStatus] : undefined;

      return {
        logIsSuccess: state.executionMap[nodeId]?.[pathKey]?.isSuccess,
        stoppedState,
        isStoppedStep:
          stoppedState !== undefined &&
          state.stoppedAt?.nodeId === nodeId &&
          state.stoppedAt?.pathKey === pathKey,
      };
    }),
  );

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
    if (isStoppedStep && stoppedState) return stoppedState;
    if (logIsSuccess === true) return "success";
    if (logIsSuccess === false) return "failed";
    return stoppedState ? "not-reached" : "idle";
  }

  const liveNodeLog = getLiveNodeLog(liveLoopIndex, subflowCallerId, nodeId, liveActiveIteration);
  return (liveNodeLog && liveStatus) || "idle";
};
