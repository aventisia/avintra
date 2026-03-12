import { ExecuteFlow } from "@/features/execute-flow";

import { cn } from "@aventisia/ui/lib";

import { PublishedAgentDto } from "../dtos/published-agent-dto";
import { AAListItemActions } from "./agents-assist-item-actions";

interface AgentsAssistItemProps {
  agentData: PublishedAgentDto;
}

export const AgentsAssistItem = ({ agentData }: AgentsAssistItemProps) => {
  return (
    <div
      className={cn(
        "mb-2 flex w-full items-center gap-3 px-1 py-0.5 last:mb-0",
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

      <div className="flex w-12 items-center justify-end gap-3">
        <ExecuteFlow />
        {/* Actions container */}
        {import.meta.env.MODE !== "production" && (
          <AAListItemActions
            flowId={agentData.refId || ""}
            versionId={agentData.id}
          />
        )}
      </div>
    </div>
  );
};
