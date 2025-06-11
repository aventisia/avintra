import { ScrollArea } from "@aventisia/ui/scroll";
import { formatDuration } from "../lib/formatDuration";
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

export const ExecutionList = () => {
  // Get flow execution store state & actions
  const { setExecutionId } = useFlowExecutionLogStore(
    useShallow((state) => ({
      setExecutionId: state.setExecutionId,
    })),
  );

  const { data: executions, isLoading } = useFetchExecutionLogs();

  if (isLoading || !executions) return <div></div>;

  return (
    <div>
      <h6 className="ml-3 py-2 text-sm">Executions</h6>
      <Command>
        <div className="mx-3 mb-2 rounded-lg bg-slate-100">
          <CommandInput
            className="h-6 text-xs"
            placeholder="Search execution..."
            autoFocus
          />
        </div>
        <ScrollArea className="h-[calc(100vh-7.5rem)] px-2">
          <CommandList className="">
            <CommandEmpty className="h-full">
              <NoContentMessage
                className="mt-5"
                primaryMessage="No Executions found"
              />
            </CommandEmpty>
            {executions.map((exec) => (
              <CommandItem
                key={exec.executionId}
                value={exec.number}
                onSelect={() => setExecutionId(exec.executionId, exec.nodes)}
                className="flex cursor-pointer items-center gap-2 rounded-lg p-2"
              >
                {exec.isSuccess ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-500" />
                )}
                <span>{exec.number}</span>

                <div className="text-2xs text-muted-foreground">
                  {new Date(exec.executedOn).toLocaleString()} |{" "}
                  {formatDuration(exec.duration)}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </ScrollArea>
      </Command>
    </div>
  );
};
