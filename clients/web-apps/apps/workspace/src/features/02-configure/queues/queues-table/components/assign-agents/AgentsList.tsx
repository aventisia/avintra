import { NoContentMessage } from "@avplatform/ui";
import { LoadingSpinner } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Command, CommandEmpty, CommandItem, CommandList } from "@avplatform/ui/command";
import { BotIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useFetchQueueAgents } from "../../hooks/useFetchQueueAgents";
import { useQueueAgentsStore } from "../../stores/queue-agents-store";
import { AgentsListItemActions } from "./assign-agent-item-actions";

const AgentsList = () => {
  const { queueId } = useQueueAgentsStore(
    useShallow((s) => ({
      queueId: s.queueId,
    })),
  );

  // Use to fetch agents list of Queue
  const { data, isLoading } = useFetchQueueAgents(queueId);
  const agents = data?.data ?? [];

  return (
    <section aria-label="Assigned agents">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Assigned</h3>
        {isLoading ? (
          <LoadingSpinner className="h-4 w-4" />
        ) : (
          agents.length > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {agents.length}
            </Badge>
          )
        )}
      </div>
      <Command className="bg-transparent">
        <CommandEmpty>
          <NoContentMessage
            Icon={BotIcon}
            primaryMessage="No agents assigned yet"
            secondaryMessage="Search above to assign your first agent to this queue."
            className="py-8"
          />
        </CommandEmpty>
        <CommandList>
          {agents.map((val) => {
            return (
              <CommandItem
                key={val.id}
                value={`${val.flowName} ${val?.versionNumber}`}
                className="group/CommandItem cursor-default rounded-xl border border-transparent p-1 transition-colors hover:border-border hover:bg-accent/60 data-[selected=true]:bg-accent/60"
              >
                <div className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BotIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 grow truncate text-sm font-medium text-foreground">
                    {val.flowName}
                  </span>
                  {val?.versionNumber && (
                    <Badge variant="secondary" className="shrink-0 rounded-full">
                      v{val.versionNumber}
                    </Badge>
                  )}
                  <span className="shrink-0 transition-opacity lg:opacity-0 lg:group-hover/CommandItem:opacity-100 lg:focus-within:opacity-100">
                    <AgentsListItemActions item={val} />
                  </span>
                </div>
              </CommandItem>
            );
          })}
        </CommandList>
      </Command>
    </section>
  );
};

export default AgentsList;
