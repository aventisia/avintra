import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { useGroupToggle } from "@/features/react-flow/hooks/useGroupToggle";
import { useNodeHover } from "@/hooks/useNodeHover";
import { NodeDataType } from "@/types/node-data-type";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  Node,
  NodeProps,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { ExpandIcon, ShrinkIcon } from "lucide-react";
import { memo, useEffect } from "react";

import { NodeHeading } from "../node-container/node-header/NodeHeading";
import { NodeImage } from "../node-container/node-header/NodeImage";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";

type CallAgentNode = Node<NodeDataType, "callAgentNode">;

export const CallAgentNode = memo(
  ({
    data,
    selected,
    sourcePosition,
    targetPosition,
    id,
  }: NodeProps<CallAgentNode>) => {
    const { toggleGroupExpand } = useGroupToggle();
    const { isHovered, onMouseEnter, onMouseLeave } = useNodeHover();

    const { updateNodeData } = useReactFlow();
    useEffect(() => {
      if (data.type !== "callAgentNode") return;
      const isNewMod = ["Call Agent"].includes(data.label);

      if (data?.selectedAgent || isNewMod) {
        const newLabel = data?.selectedAgent
          ? data?.selectedAgent?.name
          : "Call Agent";
        if (newLabel) {
          //  node by id and update its label
          updateNodeData(id, {
            label: newLabel,
          });
        }
      }
    }, [data.label, data?.selectedAgent]);

    return (
      <>
        <div
          className={cn(
            "custom-drag-handle relative flex h-16 w-16 rounded-full border-2 border-[#1E1B4B] bg-[#1E1B4B] hover:ring hover:ring-ring",
            selected && "border-primary ring ring-ring",
            data?.isDisabled && "opacity-50",
            data?.isCut && "border-red-400 opacity-60",
          )}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
            <div className="flex h-full w-full items-center justify-center">
              {/* <NodeHeader> */}
              <CheckCircleIcon className="absolute left-[1.625rem] top-1 h-2 w-2 text-green-500" />
              <NodeImage src="/assets/NewAgentIcon.svg" />
              <NodeHeading className="text-2xs">{data.label}</NodeHeading>
              <InputHandle position={targetPosition} />
              <OutputHandle position={sourcePosition} />
            </div>
          </OpenNodeConfig>
          <NodeToolbar offset={5} isVisible={isHovered} position={Position.Top}>
            {data?.isGroupHead && (
              <Tooltip content={data?.isExpanded ? "Collapse" : "Expand"}>
                <Button
                  variant={"outline"}
                  size={"icon6"}
                  className={cn(
                    "group z-10 rounded-full ",
                    "hover:bg-primary  mt-1",
                    "aria-[expanded=true]:bg-primary aria-[expanded=true]:opacity-100",
                    "nodrag nopan",
                  )}
                  onClick={() => toggleGroupExpand(data?.groupId || "")}
                >
                  {data?.isExpanded ? (
                    <ShrinkIcon
                      className={cn(
                        "h-3.5 w-3.5 stroke-[1.5] text-[--icon-color] opacity-50",
                        "group-hover:text-white group-hover:opacity-100",
                        "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
                      )}
                    />
                  ) : (
                    <ExpandIcon
                      className={cn(
                        "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
                        "group-hover:text-white group-hover:opacity-100",
                        "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
                      )}
                    />
                  )}
                </Button>
              </Tooltip>
            )}
          </NodeToolbar>
        </div>
      </>
    );
  },
);

CallAgentNode.displayName = "CallAgentNode";
