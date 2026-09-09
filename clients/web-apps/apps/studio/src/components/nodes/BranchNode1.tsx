import { cn } from "@avplatform/ui/lib";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GitBranchIcon } from "lucide-react";
import { memo } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { LockedNodeOverlay } from "@/features/collaboration/components/LockedNodeOverlay";
import { useNodeLockedByOther } from "@/features/collaboration/hooks/useNodeLockedByOther";
import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { buildLiveLoopIndex, isLiveBranchNodeActive } from "@/features/execute-flow/utils/live-loop-index";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";
import { NodeDataType } from "@/types/node-data-type";

import OpenNodeLog from "../node-container/OpenNodeLog";
import { NodeHeading } from "../node-container/node-header/NodeHeading";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";

type BranchNode1 = Node<NodeDataType, "branchNode1">;

export const BranchNode1 = memo(
  ({
    id: nodeId,
    data: nodeData,
    targetPosition,
    sourcePosition,
    selected,
  }: NodeProps<BranchNode1>) => {
    const isExecutionLog = useIsExecutionLogsRoute();
    const { getNodes } = useReactFlow();
    const [searchParams] = useSearchParams();
    const subflowCallerId = searchParams.get("ci") || "";

    const { branchStats, showBranchStats, executionMap, nodeToParentStack, activeIteration } =
      useExecutionStore();
    const { liveExecutionMap, nodeLogHistory, liveActiveIteration } = useLiveExecutionStore(
      useShallow((state) => ({
        liveExecutionMap: state.liveExecutionMap,
        nodeLogHistory: state.nodeLogHistory,
        liveActiveIteration: state.liveActiveIteration,
      })),
    );
    const liveStatus = nodeData?.isDisabled
      ? undefined
      : liveExecutionMap[nodeId];
    const liveIndex = buildLiveLoopIndex(nodeLogHistory, getNodes());
    const branchActive = isLiveBranchNodeActive(
      liveIndex,
      subflowCallerId,
      nodeId,
      liveActiveIteration,
    );
    const selectedLiveStatus = branchActive ? liveStatus : undefined;

    // Collaboration: branch nodes render outside NodeContainer, so apply the same
    // lock protection here (block interaction + overlay) when another user holds the lock.
    const { lockedByOther } = useNodeLockedByOther(nodeId);

    // Resolve this branch's path coordinate so the highlight reflects the SELECTED iteration.
    // `branchStats` is a total across every iteration, so using it for the border kept the
    // branch green whenever it ran in ANY iteration — including iterations the user is not
    // currently viewing. It is still used for the hit-count badge, which is intentionally a
    // total.
    const parents = nodeToParentStack[nodeId] || [];
    const pathKey = parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";
    const isActiveInPath = !!executionMap[nodeId]?.[pathKey];

    const totalHits = branchStats[nodeId] || 0;

    const pillBorderClass =
      !nodeData?.isDisabled && isExecutionLog && isActiveInPath
        ? "border-green-500"
        : selectedLiveStatus === "running"
          ? "border-blue-500"
          : selectedLiveStatus === "success"
            ? "border-green-500"
            : selectedLiveStatus === "failed"
              ? "border-red-500"
              : "border-slate-400";

    return (
      <>
        <>
          {nodeData?.name === "ConditionalBranchActivity" ? (
            <OpenNodeLog
              nodeId={nodeId}
              showIcon={false}
              showBorder={false}
              isDisabled={nodeData?.isDisabled}
            >
              <div
                className={cn(
                  "relative",
                  lockedByOther && "pointer-events-none opacity-70",
                )}
              >
                <OpenNodeConfig {...{ nodeData, nodeId }}>
                  <div
                    className={cn(
                      "flex  justify-center relative",
                      nodeData?.isDisabled && "opacity-50",
                    )}
                  >
                    {isExecutionLog && totalHits > 0 && showBranchStats && (
                      <div className="absolute top-[0.2rem] -left-2  bg-primary text-white text-[9px] px-1.5 rounded-full font-bold border-2  z-20">
                        {totalHits}
                      </div>
                    )}
                    <div
                      className={cn(
                        "grid h-6 w-12 place-items-center rounded-full border bg-slate-200 px-2 text-sm hover:ring hover:ring-ring",
                        selected && "border-primary",
                        nodeData?.isCut && "border-red-400 opacity-60",
                        pillBorderClass,
                      )}
                    >
                      <GitBranchIcon className="h-3.5 w-3.5 scale-x-[-1] rotate-180" />{" "}
                      <NodeHeading className="top-7">{nodeData.label}</NodeHeading>
                      <InputHandle position={targetPosition} className="rounded-full opacity-0" />
                      <OutputHandle position={sourcePosition} />
                    </div>
                  </div>
                </OpenNodeConfig>
                {lockedByOther && <LockedNodeOverlay nodeId={nodeId} />}
              </div>
            </OpenNodeLog>
          ) : (
            <div
              className={cn(
                "flex h-6 w-12 justify-center relative",
                nodeData?.isDisabled && "opacity-50",
                nodeData?.isCut && "border-red-400 opacity-60",
              )}
            >
              {isExecutionLog && totalHits > 0 && showBranchStats && (
                <div className="absolute top-[0.2rem] -left-2  bg-primary text-white text-[9px] px-1.5 rounded-full font-bold border-2  z-20">
                  {totalHits}
                </div>
              )}
              <div
                className={cn(
                  "grid h-6 w-12 place-items-center rounded-full border bg-slate-200 px-2 text-sm",
                  pillBorderClass,
                )}
              >
                <InputHandle position={targetPosition} className="rounded-full opacity-0" />
                <GitBranchIcon className="h-3.5 w-3.5 scale-x-[-1] rotate-180" />{" "}
                <NodeHeading className="top-8">{nodeData.label}</NodeHeading>
                <OutputHandle position={sourcePosition} />
              </div>
            </div>
          )}
        </>
      </>
    );
  },
);

BranchNode1.displayName = "BranchNode1";
