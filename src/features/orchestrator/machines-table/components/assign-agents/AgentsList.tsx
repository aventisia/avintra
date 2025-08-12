import { NoContentMessage } from "@aventisia/ui";
import {
  CommandInput,
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@aventisia/ui/command";
import { ScrollArea } from "@aventisia/ui/scroll";
import { BotIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { SelectAgentTableDto } from "../../dtos/select-agent-table-dto";
import { useFetchSelectTableAgents } from "../../hooks/useFetchSelectAgents";
import { useAssignAgentsStore } from "../../stores/assign-agents-store";

import { RemoveAgentButton } from "./RemoveAgentButton";

const AgentsList = () => {
  const { machineId } = useAssignAgentsStore(
    useShallow((s) => ({
      machineId: s.machineId,
      setMachineId: s.setMachineId,
    })),
  );

  const { data } = useFetchSelectTableAgents(machineId);

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
      </CommandEmpty>{" "}
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
                    <div className="flex grow items-center gap-2">
                      {/* Agent name */}
                      <div className="flex flex-col">
                        <p>
                          {val.name} -v{val.versionNumber}
                        </p>
                        {/* <span className="text-2xs text-muted-foreground">
                        {val.type}
                      </span> */}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <RemoveAgentButton agentId={val.id} />
                      {/* <Button
                        onClick={() => {
                          setCurrDel(val.id);
                          //  mutate({ flowVersionId, machineIds: [val.id] });
                        }}
                        variant="caution"
                        size="icon7"
                        disabled={isPending && currDel == val.id}
                      >
                        {isPending && currDel == val.id ? (
                          <LoadingSpinner className="h-4 w-4" />
                        ) : (
                          <Trash2Icon className="h-4 w-4" />
                        )}
                      </Button> */}
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
