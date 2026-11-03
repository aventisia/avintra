import { EmptyState } from "@avplatform/ui";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { ScrollArea } from "@avplatform/ui/scroll";
import { MonitorIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { AssignMachineDto } from "../../dtos/assign-machine-dto";
import { useFetchMachines } from "../../hooks/useFetchMachines";
import { useAssignMachineStore } from "../../stores/assign-machine-store";
import { ExecutionAction } from "../table-actions/ExecutionAction";
import { MachinesListItemActions } from "./assign-machine-item-actions";

const MachinesList = () => {
  const { flowVersionId, setMachineIds } = useAssignMachineStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
      setMachineIds: s.setMachineIds,
    })),
  );

  const { data } = useFetchMachines(flowVersionId);

  useEffect(() => {
    if (data) setMachineIds(data?.data.filter((v) => v.isAssigned).map((v) => v.id));
  }, [data, setMachineIds]);

  return (
    <Command>
      <div className="my-1.5 rounded-lg bg-sunken">
        <CommandInput className="h-9 text-xs" placeholder="Search..." autoFocus />
      </div>
      <CommandEmpty>
        <EmptyState
          // className="-mt-5"
          Icon={MonitorIcon}
          primaryMessage="No machine found"
        />
      </CommandEmpty>
      <ScrollArea>
        <CommandList>
          {data?.data
            ?.filter((val: AssignMachineDto) => val.isAssigned)
            ?.map((val: AssignMachineDto) => {
              return (
                <CommandItem
                  key={val.id}
                  value={`${val.id}`}
                  className="group/CommandItem cursor-pointer rounded-lg p-1"
                >
                  <div
                    className={
                      "flex w-full justify-between items-center gap-3 rounded-lg px-0.5 py-0.5 pl-2"
                    }
                  >
                    {/* Content container */}
                    <p title={val.name} className="max-w-60 truncate">
                      {val.name}
                    </p>

                    <div className="flex items-center gap-2">
                      <ExecutionAction
                        executionState={val.status}
                        isDisabled={false}
                        rowId={val.id}
                        machineName={val.name}
                        jobId={val.jobId}
                      />
                      <MachinesListItemActions id={val.id} />
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

export default MachinesList;
