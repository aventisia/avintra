import { cn } from "@aventisia/ui/lib";

import { AgentsAssistDto } from "../dtos/agent-assist-dto";

import { AgentsListItemActions } from "./assign-agent-item-actions";
import { ExecutionAction } from "./assign-agent-item-actions/ExecutionAction";

interface AgentsAssistItemProps {
  agentData: AgentsAssistDto;
}

export const AgentsAssistItem = ({ agentData }: AgentsAssistItemProps) => {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-0.5 py-0.5 pl-2",
      )}
    >
      {/* Content container */}
      <div className="flex grow flex-col gap-0">
        {/* Agent name */}
        <span className="truncate text-xs font-medium leading-5">
          {agentData?.name}
        </span>

        {/* Time container */}
        <div className="mt-[1px] flex items-center text-2xs text-muted-foreground">
          {"Version:"} {agentData?.versionNumber}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ExecutionAction
          executionState=""
          isDisabled={false}
          rowId={agentData.id}
        />
        {/* Actions container */}
        <AgentsListItemActions id={agentData.id || ""} />
      </div>
    </div>
  );
};
