import { NoContentMessage } from "@avplatform/ui";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
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
      <CommandEmpty>
        <NoContentMessage Icon={BotIcon} primaryMessage="No Agent found" />
      </CommandEmpty>
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
                <AgentsListItemActions item={val} />
              </div>
            </CommandItem>
          );
        })}
      </CommandList>
    </Command>
  );
};

export default AgentsList;
