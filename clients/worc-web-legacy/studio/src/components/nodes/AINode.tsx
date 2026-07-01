import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import {
  Node,
  NodeProps,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { BrainCircuitIcon, ExpandIcon, ShrinkIcon } from "lucide-react";
import { memo, useEffect } from "react";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useGroupToggle } from "@/features/react-flow/hooks/useGroupToggle";
import { useNodeHover } from "@/hooks/useNodeHover";
import { ModelConfigType } from "@/types/model-config-type";
import { NodeDataType, NodeInputType } from "@/types/node-data-type";

import { ModelInputHandle } from "../handles/ModelInputHandle";
import OpenNodeLog from "../node-container/OpenNodeLog";
import { NodeImage } from "../node-container/node-header/NodeImage";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";

type AINode = Node<NodeDataType, "aiNode">;

export const AINode = memo(
  ({
    data,
    selected,
    sourcePosition,
    targetPosition,
    id,
  }: NodeProps<AINode>) => {
    const { toggleGroupExpand } = useGroupToggle();
    const { isHovered, onMouseEnter, onMouseLeave } = useNodeHover();

    const { updateNodeData, updateNode, getNodes } = useReactFlow();

    useEffect(() => {
      if (data.type !== "aiNode") return;
      if (data.inputs) {
        const modelNode = getNodes().find(
          (n) => n.type == "modelNode" && n?.parentId == id,
        );
        if (modelNode) updateNode(modelNode.id, { hidden: false });
      }

      if (data?.selectedModel) {
        const newLabel = data?.selectedModel ?? data?.selectedModel?.name;
        if (newLabel) {
          //  node by id and update its label
          updateNodeData(id, {
            label: newLabel,
          });
        }
      }
    }, [data.label, data?.inputs, data?.selectedModel]);

    function getModel(config: NodeInputType[] | undefined): string[] {
      const modelConfigItem = config?.find((item) =>
        item.key.includes("__ModelConfig__"),
      );

      if (!modelConfigItem) return [];

      const value = modelConfigItem.value as ModelConfigType;

      return value?.model ? [value.model] : [];
    }

    const isExecutionLog = useIsExecutionLogsRoute();

    //Get llm for the selected model
    const llm = data.name.includes("AIAgent")
      ? getModel(data?.inputs)
      : (data?.selectedModel?.llMs as unknown as string[]);

    return (
      <OpenNodeLog nodeId={id}>
        <div
          className={cn(
            "custom-drag-handle flex h-16 w-48  rounded-lg border border-[#1E1B4B] bg-[#1E1B4B] hover:ring hover:ring-ring",
            data.color,
            selected && "border-primary ring ring-ring",
            data?.isDisabled && "opacity-50",
            data?.isCut && "border-red-400 opacity-60",
            isExecutionLog && "border-0 ring-0",
          )}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
            <div className="h-full w-full flex items-center gap-2 px-2.5">
              {data.img ? (
                <NodeImage
                  className="!opacity-100 !brightness-[5] h-7 w-7"
                  src={data.img}
                />
              ) : (
                <BrainCircuitIcon className="text-white" />
              )}

              <div className="flex h-full w-full  flex-col justify-center gap-1">
                <h3 className="w-[8.5rem]  truncate text-start text-sm font-medium text-white capitalize">
                  {data.label}
                </h3>

                {/* LLM Badge */}

                {llm?.length > 0 && (
                  <div className="flex items-center gap-2">
                    {llm.map((value: string) => (
                      <Badge
                        key={value}
                        variant="outline"
                        className="bg-white/10  text-white text-3xs leading-tight"
                      >
                        <span className="max-w-28  truncate">{value}</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </OpenNodeConfig>
        </div>
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

        {/* Main Flow Handles */}
        <InputHandle position={targetPosition} id="main-in" />
        <OutputHandle position={sourcePosition} id="main-out" />

        <ModelInputHandle isConnectable={!!llm?.length} />

        {/* <Handle
          position={Position.Bottom}
          id="memory-input"
          type="target"
          className="z-[5] h-1.5 w-1.5 rounded-full border-indigo-500 bg-indigo-400 bottom-0 left-24"
        />
        <Handle
          type="target"
          position={Position.Bottom}
          id="tools-input"
          className="z-[5] h-1.5 w-1.5 rounded-full border-indigo-500 bg-indigo-400 bottom-0  left-36"
        /> */}
      </OpenNodeLog>
    );
  },
);

AINode.displayName = "AINode";
