import { LoadingSpinner, NoContentMessage } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  CommandInput,
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@aventisia/ui/command";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Trash2Icon, MonitorIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { AssignMachineDto } from "../../dtos/assign-machine-dto";
import { useFetchMachines } from "../../hooks/useFetchMachines";
import { useRemoveMachineMutation } from "../../hooks/useRemoveMachineMutation";
import { useAssignMachineStore } from "../../stores/assign-machine-store";

const MachinesList = () => {
  const [currDel, setCurrDel] = useState<string>("");

  const { flowVersionId, setMachineIds } = useAssignMachineStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
      setMachineIds: s.setMachineIds,
    })),
  );

  const { data } = useFetchMachines(flowVersionId);

  const { mutate, isPending } = useRemoveMachineMutation();

  useEffect(() => {
    if (data)
      setMachineIds(data?.data.filter((v) => v.isAssigned).map((v) => v.id));
  }, [data, setMachineIds]);

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
          Icon={MonitorIcon}
          primaryMessage="No Machine found"
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
                      "flex w-full items-center gap-3 rounded-lg px-0.5 py-0.5 pl-2"
                    }
                  >
                    {/* Content container */}
                    <p className="grow">{val.name}</p>
                    <div>
                      <Button
                        onClick={() => {
                          setCurrDel(val.id);
                          mutate({ flowVersionId, machineIds: [val.id] });
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
                      </Button>
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
