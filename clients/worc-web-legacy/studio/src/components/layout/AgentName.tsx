import { LoadingSpinner } from "@aventisia/ui";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
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

  const [isDirty, setIsDirty] = useState<string>();

  const { mutate: updateFlow, isPending } = useUpdateAgentNameMutation();

  useEffect(() => {
    setIsDirty(currentFlow.name);
  }, []);

  const isAgentHistory = useIsVersionHistoryRoute();

  const isExecutionLog = useIsExecutionLogsRoute();

  return (
    <Tooltip content={currentFlow.name ?? viewAgentName}>
      <div className="flex items-center">
        {!isAgentHistory && !isExecutionLog ? (
          <>
            <AutoSizeInput
              name="label"
              className={cn(
                "max-w-80 truncate rounded-none !border-0 !border-none bg-transparent !p-0 !text-xs !shadow-none !outline-none !ring-0",
                className,
              )}
              value={currentFlow.name}
              onChange={(e) => {
                setCurrentFlow({ ...currentFlow, name: e.target.value });
              }}
              onBlur={() => {
                if (isDirty?.trim() !== currentFlow?.name?.trim())
                  updateFlow({
                    name: currentFlow.name,
                    id: currentFlow.id,
                    type: currentFlow.type,
                  });
              }}
            />
            {isPending ? (
              <LoadingSpinner className="h-3 w-3 text-muted-foreground" />
            ) : null}
          </>
        ) : (
          <span className={cn("mt-0.5 max-w-80 truncate !text-xs", className)}>
            {viewAgentName}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default AgentName;
