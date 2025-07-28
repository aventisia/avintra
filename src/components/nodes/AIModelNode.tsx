import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { ReactFlowContextMenu } from "@/features/react-flow/components/context-menu";
import { cn } from "@aventisia/ui/lib";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";
import { BrainCircuit, GripVertical } from "lucide-react";
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
  const { nodeId, nodeData } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeId: state.nodeId,
      nodeData: state.nodeData,
    })),
  );

  const { nodes, setNodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    })),
  );

  useEffect(() => {
    if (data.type !== "aiNode") return;
    if (data?.selectedModel) {
      const newLabel = data?.selectedModel?.name;
      // Find the node by id and update its label
      const updatedNodes = nodes.map((node: Node) => {
        if (node.id === nodeId && nodeData?.type == "aiNode") {
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
  }, [data?.selectedModel]);

  //Get llm for the selected model
  const llm = data?.selectedModel?.llMs as unknown as string[];

  return (
    <ReactFlowContextMenu>
      <div
        className={cn(
          "flex h-[7.25rem] w-[19.5rem] overflow-clip rounded-lg border-2 border-[#7D76EC] hover:ring hover:ring-ring",
          data.color,
          selected && "border-primary ring ring-ring",
          data?.isDisabled && "opacity-50",
        )}
      >
        <div
          className={cn(
            "custom-drag-handle flex h-full w-5 cursor-grab items-center justify-center rounded-l-lg bg-[#13112F]",
          )}
        >
          <GripVertical className={cn("h-5 w-5 text-white")} />
        </div>
        <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
          <div className="flex h-full w-[18rem] flex-1 flex-col items-start gap-2.5 rounded-r-lg bg-[#1E1B4B] p-3 text-white">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-white" />
              <h3 className="line-clamp-1 flex-1 text-start text-lg font-semibold capitalize">
                {data.label}
              </h3>
            </div>
            {/* <Separator className="bg-[#35325D]" /> */}
            {/* Description */}
            <p className="line-clamp-1 text-start text-sm text-secondary-foreground">
              {data.description}
            </p>

            {/* LLM Badge */}

            {llm?.length > 0 && (
              <div className="flex items-center gap-2">
                {llm.map((value: string) => (
                  <Badge
                    key={value}
                    variant="outline"
                    className="bg-white/10 text-white"
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </OpenNodeConfig>
      </div>
      <InputHandle position={targetPosition} />
      <OutputHandle position={sourcePosition} />
    </ReactFlowContextMenu>
  );
};
