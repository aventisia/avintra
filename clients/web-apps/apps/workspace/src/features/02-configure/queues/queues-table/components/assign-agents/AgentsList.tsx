import { NoContentMessage } from "@avplatform/ui";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { ScrollArea } from "@avplatform/ui/scroll";
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
  const { data } = useFetchQueueAgents(queueId);

  return (
    <Command>
      <div className="my-1.5 rounded-lg bg-slate-100">
        <CommandInput className="h-9 text-xs" placeholder="Search..." autoFocus />
      </div>
      <CommandEmpty>
        <NoContentMessage
          // className="-mt-5"
          Icon={BotIcon}
          primaryMessage="No Agent found"
        />
      </CommandEmpty>
      <ScrollArea>
        <CommandList>
          {data?.data?.map((val) => {
            return (
              <CommandItem
                key={val.id}
                value={`${val.flowName} ${val?.versionNumber}`}
                className="group/CommandItem cursor-pointer rounded-lg p-1"
              >
                <div className={"flex w-full items-center gap-3 rounded-lg px-0.5 py-0.5 pl-2"}>
                  {/* Content container */}
                  <p className="grow">{`${val.flowName} -v${val?.versionNumber}`}</p>
                  <div className="flex items-center gap-2">
                    <span className="-mt-0.5 text-2xs text-muted-foreground">
                      {" "}
                      {val.accessType?.replace(/([A-Z])/g, " $1")}
                    </span>
                    <AgentsListItemActions item={val} />
                  </div>
                </div>
              </CommandItem>
            );
          })}
        </CommandList>
      </ScrollArea>
    </Command>
  );
};

export default AgentsList;
