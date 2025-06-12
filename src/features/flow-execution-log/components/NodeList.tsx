import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { formatDuration } from "../lib";
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
  const { selectedNodeId, selectedExecutionId, setNodeId } =
    useFlowExecutionLogStore(
      useShallow((state) => ({
        selectedExecutionId: state.selectedExecutionId,
        selectedNodeId: state.selectedNodeId,
        setNodeId: state.setNodeId,
      })),
    );

  const { data: executions } = useFetchExecutionLogs();

  const exec = executions?.find((e) => e.executionId === selectedExecutionId);
  if (!exec) return null;

  return (
    <>
      <h6 className="ml-3 py-2 text-sm">Nodes</h6>
      <Command key="node">
        <div className="mx-3 mb-2 rounded-lg bg-slate-100">
          <CommandInput
            className="h-10 text-xs"
            placeholder="Search..."
            autoFocus
          />
        </div>
        <CommandEmpty className="h-full">
          <NoContentMessage className="mt-5" primaryMessage="No Nodes found" />
        </CommandEmpty>

        <ScrollArea className="h-[calc(100vh-9.5rem)] px-2">
          <CommandList key="nodeList" className="">
            {exec.nodes.map((node) => (
              <CommandItem
                key={node.nodeId}
                value={`${node.nodeName} ${node.nodeId}`}
                onSelect={() => setNodeId(node.nodeId)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg p-2",
                  node.nodeId == selectedNodeId && "bg-accent",
                )}
              >
                {node.isSuccess ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-500" />
                )}
                <div className="flex flex-1 items-center justify-between">
                  <span className="w-40 truncate text-xs">{node.nodeName}</span>
                  <div className="text-2xs text-muted-foreground">
                    {formatDuration(node.duration)}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </ScrollArea>
      </Command>
    </>
  );
};
