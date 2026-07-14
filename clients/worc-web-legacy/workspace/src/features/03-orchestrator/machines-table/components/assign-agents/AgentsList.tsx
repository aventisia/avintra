import { NoContentMessage } from "@aventisia/ui";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@aventisia/ui/command";
import { ScrollArea } from "@aventisia/ui/scroll";
import { BotIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { SelectAgentTableDto } from "../../dtos/select-agent-table-dto";
import { useFetchSelectTableAgents } from "../../hooks/useFetchSelectAgents";
import { useAssignAgentsStore } from "../../stores/assign-agents-store";
import { ExecutionAction } from "./ExecutionAction";
import { AgentsListItemActions } from "./assign-agent-item-actions";

const AgentsList = () => {
  const { osID, machineId } = useAssignAgentsStore(
    useShallow((s) => ({
      machineId: s.machineId,
      osID: s.osID,
    })),
  );

  // Use OS id to only to fetch agents list for all other crud operations and query keys machine id is used
  const { data } = useFetchSelectTableAgents({ osID, machineId });

  return (
    <Command>
      <div className="my-1.5 rounded-lg bg-slate-100">
        <CommandInput
          className="h-9 text-xs"
          placeholder="Search..."
          autoFocus
        />
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
          {data?.data
            ?.filter((val: SelectAgentTableDto) => val.isAssigned)
            ?.map((val: SelectAgentTableDto) => {
              return (
                <CommandItem
                  key={val.id}
                  value={`${val.name} ${val.versionNumber}`}
                  className="group/CommandItem cursor-pointer rounded-lg p-1"
                >
                  <div
                    className={
                      "flex w-full items-center gap-3 rounded-lg px-0.5 py-0.5 pl-2"
                    }
                  >
                    {/* Content container */}
                    <p className="grow">{`${val.name} -v${val.versionNumber}`}</p>
                    <div className="flex items-center gap-2">
                      <ExecutionAction
                        executionState={val.status}
                        isDisabled={false}
                        rowId={val.id}
                        jobId={val.jobId}
                      />
                      <AgentsListItemActions id={val.id} />
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
