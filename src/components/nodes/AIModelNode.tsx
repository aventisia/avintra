import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { ReactFlowContextMenu } from "@/features/react-flow/components/context-menu";
import { cn } from "@aventisia/ui/lib";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";
import { GripVertical, Sparkles } from "lucide-react";
import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { useShallow } from "zustand/react/shallow";
import { Badge } from "@aventisia/ui/badge";
import { useEffect } from "react";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

type AIModelNode = Node<NodeDataType, "aiNode">;

export const AIModelNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition,
  id,
}: NodeProps<AIModelNode>) => {
  // Get node unique name state (required to get config panel data)
  const { nodeId } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeId: state.nodeId,
    })),
  );

  const { nodes, setNodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    })),
  );

  useEffect(() => {
    if (data?.outputs?.length) {
      const newLabel = data?.outputs[0].key + " " + "AI Node";
      // Find the node by id and update its label
      const updatedNodes = nodes.map((node: Node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
            },
          };
        }
        return node;
      });

      // Update the nodes in the store
      setNodes(updatedNodes);
    }
  }, [data?.outputs, nodeId, setNodes]);

  //Get llm for the selected model
  const llm = data.inputs?.find((val) => val.key.includes("llm"))
    ?.value as string;

  return (
    <ReactFlowContextMenu>
      <div
        className={cn(
          "flex h-[7rem] w-[19.5rem] overflow-clip rounded-lg border-2 border-indigo-300 hover:ring hover:ring-ring",
          data.color,
          selected && "border-primary ring ring-ring",
          data?.isDisabled && "opacity-50",
        )}
      >
        <div
          className={cn(
            "custom-drag-handle flex h-full w-5 cursor-grab items-center justify-center rounded-l-lg bg-indigo-700",
          )}
        >
          <GripVertical className={cn("h-5 w-5 text-slate-300")} />
        </div>
        <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
          <div className="flex h-full w-[18rem] flex-1 flex-col justify-between rounded-r-lg bg-gradient-to-br from-indigo-500 to-indigo-700 px-3 pb-3 text-white">
            <div className="flex flex-1 items-center justify-between gap-3">
              {/* Sparkle Icon */}

              <Sparkles className="text-white" />
              <div className="flex flex-1 flex-col items-start gap-2">
                <h3 className="line-clamp-1 text-start text-lg font-semibold">
                  {data.label}
                </h3>
                {/* LLM Badge */}
                {llm && (
                  <Badge variant="outline" className="bg-white/10 text-white">
                    {llm}
                  </Badge>
                )}
              </div>
            </div>
            {/* Description */}
            <p className="truncate text-start text-sm text-secondary-foreground">
              {data.description}
            </p>
          </div>
        </OpenNodeConfig>
      </div>
      <InputHandle position={targetPosition} />
      <OutputHandle position={sourcePosition} />
    </ReactFlowContextMenu>
  );
};
