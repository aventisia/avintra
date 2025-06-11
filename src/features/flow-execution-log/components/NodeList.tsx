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

export const NodeList = () => {
  // Get flow execution store state & actions
  const { selectedExecutionId, setNodeId } = useFlowExecutionLogStore(
    useShallow((state) => ({
      selectedExecutionId: state.selectedExecutionId,
      setNodeId: state.setNodeId,
    })),
  );

  const { data: executions } = useFetchExecutionLogs();

  const exec = executions?.find((e) => e.executionId === selectedExecutionId);
  if (!exec) return null;

  return (
    <div>
      <h6 className="ml-3 py-2 text-sm">Nodes</h6>
      <Command>
        <div className="mx-3 mb-2 rounded-lg bg-slate-100">
          <CommandInput
            className="h-6 text-xs"
            placeholder="Search nodes..."
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
            {exec.nodes.map((node) => (
              <CommandItem
                key={node.nodeId}
                value={node.nodeName}
                onSelect={() => setNodeId(node.nodeId)}
                className="flex cursor-pointer items-center gap-2 rounded-lg p-2"
              >
                {node.isSuccess ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-500" />
                )}
                <div className="flex flex-1 items-center justify-between">
                  <span className="w-60 truncate text-xs">{node.nodeName}</span>
                  <div className="text-2xs text-muted-foreground">
                    {formatDuration(node.duration)}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </ScrollArea>
      </Command>
    </div>
  );
};
