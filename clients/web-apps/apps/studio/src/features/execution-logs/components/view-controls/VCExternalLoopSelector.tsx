import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ChevronLeftIcon, ChevronRightIcon, RepeatIcon } from "lucide-react";

import { useExecutionStore } from "../../stores/execution-log-store";
import { VCBContainer } from "./VCBContainer";

/**
 * Iteration selector for loops that are NOT part of the currently loaded graph.
 *
 * The common case is a sub-flow invoked from inside a loop: the sub-flow's nodes inherit the
 * parent loop's `loopReferenceId` / `loopIterationIndex`, but the loop node itself lives in the
 * parent flow, so `ForLoopNode` (which renders the inline `n / total` badge) is not on screen.
 * Without this control the user would be stuck on the default iteration and could not inspect
 * the other iterations' logs.
 *
 * Loops that ARE present in the graph are excluded here because `ForLoopNode` already renders
 * its own badge for them.
 */
export const VCExternalLoopSelector = () => {
  const { loopRegistry, nodeTypes, activeIteration, setIteration } = useExecutionStore();

  const externalLoops = Object.entries(loopRegistry).filter(
    ([loopId, { total }]) => total > 0 && !nodeTypes[loopId],
  );

  if (externalLoops.length === 0) return null;

  return (
    <VCBContainer>
      {externalLoops.map(([loopId, { total }]) => {
        const current = activeIteration[loopId] ?? 0;

        return (
          <div key={loopId} className="flex items-center gap-0.5 px-0.5 py-0.5">
            <Tooltip content="Previous iteration" side="right">
              <Button
                size="icon6"
                variant="ghost"
                onClick={() => setIteration(loopId, current === 0 ? total - 1 : current - 1)}
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
                onClick={() => setIteration(loopId, current === total - 1 ? 0 : current + 1)}
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
