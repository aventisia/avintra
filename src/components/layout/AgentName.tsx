import { useUpdateAgentNameMutation } from "@/hooks/useUpdateAgentNameMutation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { LoadingSpinner } from "@aventisia/ui";
import { Tooltip } from "@aventisia/ui/tooltip";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import AutoSizeInput from "./AutsizeInput";

const AgentName = () => {
  // Get global store state and actions
  const { currentFlow, setCurrentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setCurrentFlow: state.setCurrentFlow,
    })),
  );

  const [isDirty, setIsDirty] = useState<string>();

  const { mutate: updateFlow, isPending } = useUpdateAgentNameMutation();

  useEffect(() => {
    setIsDirty(currentFlow.name);
  }, []);

  return (
    <Tooltip content={currentFlow.name}>
      <div className="flex items-center">
        <AutoSizeInput
          name="label"
          className="max-w-80 truncate rounded-none !border-0 !border-none bg-transparent !p-0 !text-xs !shadow-none !outline-none !ring-0"
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
      </div>
    </Tooltip>
  );
};

export default AgentName;
