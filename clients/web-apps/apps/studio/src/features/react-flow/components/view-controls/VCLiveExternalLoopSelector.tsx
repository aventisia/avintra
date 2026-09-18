import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ChevronLeftIcon, ChevronRightIcon, RepeatIcon } from "lucide-react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { buildLiveLoopIndex } from "@/features/execute-flow/utils/live-loop-index";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { VCBContainer } from "./VCBContainer";

/**
 * Live iteration selector for loops that are NOT part of the currently loaded graph.
 *
 * The common case is a sub-flow invoked from inside a loop: the sub-flow's nodes inherit the
 * parent loop's `loopReferenceId` / `loopIterationIndex`, but the loop node itself lives in the
 * parent flow, so `ForLoopNode` (which renders the inline `n / total` badge) is not on screen.
 * Without this control the user would be stuck on the latest iteration and could not inspect
 * the earlier ones while the run is still in progress.
 *
 * Loops that ARE present in the graph are excluded here because `ForLoopNode` already renders
 * its own badge for them. Renders nothing until live logs exist.
 */
export const VCLiveExternalLoopSelector = () => {
  const { nodeLogHistory, liveActiveIteration, setLiveIteration } = useLiveExecutionStore(
    useShallow((state) => ({
      nodeLogHistory: state.nodeLogHistory,
      liveActiveIteration: state.liveActiveIteration,
      setLiveIteration: state.setLiveIteration,
    })),
  );

  const { nodes } = useReactFlowExtStore(useShallow((state) => ({ nodes: state.nodes })));

  const externalLoops = useMemo(() => {
    if (nodeLogHistory.length === 0) return [];

    const index = buildLiveLoopIndex(nodeLogHistory, nodes);
    const graphNodeIds = new Set(nodes.map((node) => node.id));

    return Object.entries(index.loopRegistry).filter(
      ([loopId, { total }]) => total > 0 && !graphNodeIds.has(loopId),
    );
  }, [nodeLogHistory, nodes]);

  if (externalLoops.length === 0) return null;

  return (
    <VCBContainer>
      {externalLoops.map(([loopId, { total }]) => {
        // Default to the latest observed iteration, matching `getLivePathKey`'s fallback.
        const current = liveActiveIteration[loopId] ?? Math.max(0, total - 1);

        return (
          <div key={loopId} className="flex items-center gap-0.5">
            <Tooltip content="Previous iteration" side="right">
              <Button
                size="icon6"
                variant="ghost"
                onClick={() => setLiveIteration(loopId, current === 0 ? total - 1 : current - 1)}
              >
                <ChevronLeftIcon className="h-4 w-4 text-[--icon-color]" />
              </Button>
            </Tooltip>

            <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
              <RepeatIcon className="h-3 w-3 shrink-0" />
              {current + 1} / {total}
            </span>

            <Tooltip content="Next iteration" side="right">
              <Button
                size="icon6"
                variant="ghost"
                onClick={() => setLiveIteration(loopId, current === total - 1 ? 0 : current + 1)}
              >
                <ChevronRightIcon className="h-4 w-4 text-[--icon-color]" />
              </Button>
            </Tooltip>
          </div>
        );
      })}
    </VCBContainer>
  );
};
