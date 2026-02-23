import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType, NodeInputType } from "@/types/node-data-type";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { cn } from "@aventisia/ui/lib";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";
import { BrainCircuitIcon, GripVertical } from "lucide-react";
import { Badge } from "@aventisia/ui/badge";
import { memo, useEffect } from "react";
import { ModelConfigType } from "@/types/model-config-type";

type AIModelNode = Node<NodeDataType, "aiNode">;

export const AIModelNode = memo(
  ({
    data,
    selected,
    sourcePosition,
    targetPosition,
    id,
  }: NodeProps<AIModelNode>) => {
    const { updateNodeData } = useReactFlow();
    useEffect(() => {
      if (data.type !== "aiNode") return;
      const isNewMod = ["Attach AI Model", "Create AI Model"].includes(
        data.label,
      );
      if (data?.selectedModel || isNewMod) {
        const newLabel = data?.selectedModel
          ? data?.selectedModel?.name
          : "AI Model";
        if (newLabel) {
          //  node by id and update its label
          updateNodeData(id, {
            label: newLabel,
          });
        }
      }
    }, [data.label, data?.selectedModel]);

    function getModel(config: NodeInputType[] | undefined): string[] {
      const modelConfigItem = config?.find((item) =>
        item.key.includes("__ModelConfig__"),
      );

      if (!modelConfigItem) return [];

      const value = modelConfigItem.value as ModelConfigType;

      return value?.model ? [value.model] : [];
    }

    //Get llm for the selected model
    const llm = data.name.includes("AIAgent")
      ? getModel(data?.inputs)
      : (data?.selectedModel?.llMs as unknown as string[]);

    return (
      <>
        <div
          className={cn(
            "flex h-[7.25rem] w-[19.5rem] overflow-clip rounded-lg border-2 border-[#7D76EC] bg-[#7D76EC] hover:ring hover:ring-ring",
            data.color,
            selected && "border-primary ring ring-ring",
            data?.isDisabled && "opacity-50",
            data?.isCut && "border-red-400 opacity-60",
          )}
        >
          <div
            className={cn(
              "custom-drag-handle flex h-full w-5 cursor-grab items-center justify-center bg-[#13112F]",
            )}
          >
            <GripVertical className={cn("h-5 w-5 text-white")} />
          </div>
          <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
            <div className="flex h-full w-full flex-col items-start gap-2.5 bg-[#1E1B4B] p-3 text-white">
              <div className="flex items-center gap-3">
                <BrainCircuitIcon className="text-white" />
                <h3 className="w-56 flex-1 truncate text-start text-lg font-semibold capitalize">
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
      </>
    );
  },
);

AIModelNode.displayName = "AIModelNode";
