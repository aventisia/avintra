import { ScrollArea } from "@aventisia/ui/scroll";
import { formatDuration, getFormattedDate } from "../lib";
import { useFlowExecutionLogStore } from "../stores/flow-execution-lof-store";
import { useShallow } from "zustand/react/shallow";
import { useFetchExecutionLogs } from "../hooks/useFetchFlowExecutionLogs";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@aventisia/ui/command";
import { NoContentMessage } from "@aventisia/ui";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@aventisia/ui/lib";

export const ExecutionList = () => {
  // Get flow execution store state & actions
  const { selectedExecutionId, setExecutionId } = useFlowExecutionLogStore(
    useShallow((state) => ({
      selectedExecutionId: state.selectedExecutionId,
      setExecutionId: state.setExecutionId,
    })),
  );

  const { data: executions, isLoading } = useFetchExecutionLogs();

  if (isLoading || !executions) return <div></div>;

  return (
    <div>
      <h6 className="ml-3 py-2 text-sm">Executions</h6>
      <Command key="exe">
        <div className="mx-3 mb-2 rounded-lg bg-slate-100">
          <CommandInput
            className="h-10 text-xs"
            placeholder="Search execution..."
            autoFocus
          />
        </div>
        <CommandEmpty className="h-full">
          <NoContentMessage
            className="mt-5"
            primaryMessage="No Executions found"
          />
        </CommandEmpty>

        <ScrollArea className="h-[calc(100vh-9.5rem)] px-2">
          <CommandList key="exeList" className="">
            {executions.map((exec) => (
              <CommandItem
                key={exec.executionId}
                value={`${exec.number}`}
                onSelect={() => setExecutionId(exec.executionId, exec.nodes)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg p-2",
                  exec.executionId == selectedExecutionId && "bg-accent",
                )}
              >
                {exec.isSuccess ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-500" />
                )}
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <span>#{exec.number}</span>
                    <span className="pl-2 text-2xs text-muted-foreground">
                      {getFormattedDate(new Date(exec.executedOn))}
                    </span>
                  </div>

                  <span className="text-2xs text-muted-foreground">
                    {formatDuration(exec.duration)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </ScrollArea>
      </Command>
    </div>
  );
};
