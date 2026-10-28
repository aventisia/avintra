import { LoadingSpinner } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useUpdateAgentNameMutation } from "@/hooks/useUpdateAgentNameMutation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowViewStore } from "@/stores/react-flow-view-store";

import AutoSizeInput from "./AutsizeInput";

const AgentName = ({ className }: { className?: string }) => {
  // Get global store state and actions
  const { currentFlow, setCurrentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setCurrentFlow: state.setCurrentFlow,
    })),
  );

  const { name: viewAgentName } = useReactFlowViewStore(
    useShallow((state) => ({ name: state.name })),
  );

  const [baselineName, setBaselineName] = useState<string>();

  const { mutate: updateFlow, isPending } = useUpdateAgentNameMutation();

  // Re-baseline when the flow changes so blur-compare doesn't re-fire after save.
  useEffect(() => {
    setBaselineName(currentFlow.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFlow.id]);

  const isAgentHistory = useIsVersionHistoryRoute();

  const isExecutionLog = useIsExecutionLogsRoute();

  return (
    <Tooltip content={currentFlow.name ?? viewAgentName}>
      <div className={cn("flex w-auto min-w-16 max-w-60 shrink items-center", className)}>
        {!isAgentHistory && !isExecutionLog ? (
          <>
            <AutoSizeInput
              name="label"
              className="min-w-0 max-w-full truncate"
              value={currentFlow.name}
              onChange={(e) => {
                setCurrentFlow({ ...currentFlow, name: e.target.value });
              }}
              onBlur={() => {
                const baseline = (baselineName ?? "").trim();
                const next = (currentFlow?.name ?? "").trim();
                // Empty names are not allowed — restore the last saved name
                // without firing the update mutation.
                if (next === "") {
                  if (currentFlow?.name !== baselineName) {
                    setCurrentFlow({ ...currentFlow, name: baselineName ?? "" });
                  }
                  return;
                }
                if (baseline !== next)
                  updateFlow(
                    {
                      name: currentFlow.name,
                      id: currentFlow.id,
                      type: currentFlow.type,
                    },
                    {
                      onSuccess: () => setBaselineName(currentFlow.name),
                    },
                  );
              }}
            />
            {isPending ? <LoadingSpinner className="h-3 w-3 text-muted-foreground" /> : null}
          </>
        ) : (
          <span
            className={cn(
              "min-w-0 max-w-full truncate text-[14px] font-semibold text-ink",
              className,
            )}
          >
            {viewAgentName}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default AgentName;
