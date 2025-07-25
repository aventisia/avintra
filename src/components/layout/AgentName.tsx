import { useUpdateAgentNameMutation } from "@/hooks/useUpdateAgentNameMutation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { Input, LoadingSpinner } from "@aventisia/ui";
import { Tooltip } from "@aventisia/ui/tooltip";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

const AgentName = () => {
  const [editing, setEditing] = useState(false);

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
      {editing ? (
        <Input
          name="label"
          className="w-[8rem] !max-w-[8rem] truncate !border-0 !border-none bg-transparent !p-0 !text-base !font-semibold !shadow-none !outline-none !ring-0"
          value={currentFlow.name}
          autoFocus
          onChange={(e) => {
            setCurrentFlow({ ...currentFlow, name: e.target.value });
          }}
          fieldSize="xs"
          onBlur={() => {
            setEditing(false);
            if (isDirty?.trim() !== currentFlow?.name?.trim())
              updateFlow({
                name: currentFlow.name,
                id: currentFlow.id,
                type: currentFlow.type,
              });
          }}
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="flex h-10 items-center gap-2"
        >
          <span className="max-w-[8rem] truncate text-xs">
            {currentFlow.name}
          </span>
          {isPending ? (
            <LoadingSpinner className="h-3 w-3 text-muted-foreground" />
          ) : null}
        </div>
      )}
    </Tooltip>
  );
};

export default AgentName;
