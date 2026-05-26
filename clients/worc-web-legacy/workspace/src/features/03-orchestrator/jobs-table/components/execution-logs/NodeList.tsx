import { NoContentMessage } from "@aventisia/ui";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@aventisia/ui/command";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useExecutionLogStore } from "../../stores/execution-log-store";
import { ExecutionNode } from "../../types/execution-types";
import { formatDuration } from "../../utils";

export const NodeList = ({ nodes }: { nodes: ExecutionNode[] | undefined }) => {
  // Get flow execution store state & actions
  const { selectedNodeId, setNodeId } = useExecutionLogStore(
    useShallow((state) => ({
      selectedNodeId: state.selectedNodeId,
      setNodeId: state.setNodeId,
    })),
  );

  if (!nodes) return null;

  return (
    <>
      <h6 className="mb-3 border-b py-2 pb-1 pl-3.5 text-sm">Node Logs</h6>

      <Command key="node" className="h-fit">
        <div className="mx-3 mb-2 rounded-lg bg-slate-100">
          <CommandInput
            className="h-10 text-xs"
            placeholder="Search..."
            autoFocus
          />
        </div>
        <CommandEmpty className="">
          <NoContentMessage className="mt-5" primaryMessage="No logs found" />
        </CommandEmpty>

        <ScrollArea className="h-[calc(100vh-11rem-var(--header-height)-var(--header-padding))] px-3">
          <CommandList key="nodeList" className="">
            {nodes.map((node: ExecutionNode) => (
              <CommandItem
                key={node?.uniqueNodeId || node.nodeId}
                value={`${node.nodeName} ${node?.uniqueNodeId || node.nodeId} ${node.isSuccess ? "Success Pass" : "Failed "}`}
                onSelect={() => setNodeId(node?.uniqueNodeId || node.nodeId)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg p-2",
                  selectedNodeId === (node?.uniqueNodeId || node.nodeId) &&
                    "bg-accent",
                )}
              >
                {node.isSuccess ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-500" />
                )}
                <div className="flex flex-1 items-center justify-between">
                  <span className="line-clamp-1 text-xs">{node.nodeName}</span>
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
