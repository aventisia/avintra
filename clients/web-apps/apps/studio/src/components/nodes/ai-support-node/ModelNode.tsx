import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { ModelConfigType } from "@/types/model-config-type";
import { NodeDataType, NodeInputType } from "@/types/node-data-type";

import { cn } from "@avplatform/ui/lib";
import {
  NodeProps,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import { memo, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export const ModelNode = memo(({ id, data }: NodeProps) => {
  const { updateNodeData } = useReactFlow();

  // 1. Get all connections for this node (either as target or source)
  const connections = useHandleConnections({
    nodeId: id,
    type: "source", // Uncomment if you only want nodes that point TO this node
  });

  // 2. Get the ID of the connected node (assuming only 1 exists)
  const connectedNodeId = connections[0]?.target;

  // 3. Fetch the data of that connected node
  const connectedNodeData = useNodesData(connectedNodeId);
  useEffect(() => {
    if (connectedNodeData?.type !== "aiNode") return;
    if (connectedNodeData?.data) {
      const data = connectedNodeData?.data as NodeDataType;
      const provider = data.name.includes("AIAgent")
        ? getProvider(data?.inputs)
        : (data?.selectedModel?.provider as unknown as string);
      if (provider) {
        //  node by id and update its label
        updateNodeData(id, {
          label: provider,
        });
      }
    }
  }, [connectedNodeData]);

  function getProvider(config: NodeInputType[] | undefined): string {
    const modelConfigItem = config?.find((item) =>
      item.key.includes("__ModelConfig__"),
    );

    if (!modelConfigItem) return "";

    const value = modelConfigItem.value as ModelConfigType;

    return value?.provider;
  }

  const vaultAppIconMapper: Record<string, string> = {
    openai: "/brand-img/openai.svg",
    googlegemini: "/brand-img/gemini.svg",
    openrouter: "/brand-img/openrouter.svg",
    anthropic: "/brand-img/anthropic.svg",
    elevenlabs: "/brand-img/elevenlabs.svg",
  };

  const providerLabelMapper: Record<string, string> = {
    openai: "OpenAI",
    googlegemini: "Google Gemini",
    openrouter: "OpenRouter",
    anthropic: "Anthropic",
    elevenlabs: "Elevenlabs",
  };

  const { setShowDialog, setNodeId, setNodeData, setSelectedTab } =
    useDynamicConfigPanelStore(
      useShallow((state) => ({
        showDialog: state.showDialog,
        setNodeId: state.setNodeId,
        setShowDialog: state.setShowDialog,
        setNodeData: state.setNodeData,
        setSelectedTab: state.setSelectedTab,
      })),
    );

  return (
    <>
      <div className="relative">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full   border border-slate-300   bg-white hover:ring hover:ring-ring cursor-pointer",
            (connectedNodeData?.data?.isDisabled as NodeDataType) &&
              "opacity-50",
            (connectedNodeData?.data?.isCut as NodeDataType) &&
              "border-red-400 opacity-60",
          )}
          onDoubleClick={() => {
            setShowDialog(true);
            setNodeId(connectedNodeId);
            setNodeData(connectedNodeData?.data as NodeDataType);
            setTimeout(() => {
              setSelectedTab("Models");
            }, 100);
          }}
        >
          <NodeImage
            className="!opacity-100  h-7 w-7 "
            src={vaultAppIconMapper[data?.label as string]}
          />
        </div>
        <NodeHeading className=" w-16">
          {providerLabelMapper[data?.label as string]}
        </NodeHeading>
      </div>

      <OutputHandle position={Position.Top} className="opacity-0" />
    </>
  );
});

ModelNode.displayName = "ModelNode";
