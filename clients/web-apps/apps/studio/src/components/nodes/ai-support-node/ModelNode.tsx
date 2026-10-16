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

import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import {
  DCPFieldSchemaType,
  getNodeConfig,
  useDCPNavigationGuard,
  useDynamicConfigPanelStore,
} from "@/features/dynamic-config-panel";
import { ModelConfigType } from "@/types/model-config-type";
import { NodeDataType, NodeInputType } from "@/types/node-data-type";
import { getProviderBrandIcon } from "@/utils/provider-brand-icons.util";

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
      updateNodeData(id, {
        label: provider ?? "",
      });
    }
  }, [connectedNodeData]);

  function getProvider(config: NodeInputType[] | undefined): string {
    const providers = (config ?? [])
      .filter((item) => item.key.includes("__ModelConfig__"))
      .map((item) => (item.value as ModelConfigType)?.provider)
      .filter(Boolean);
    if (providers.length > 0) return providers[0] as string;

    const first = config?.find((item) => item.key.includes("__ModelConfig__"));
    return first ? (((first.value as ModelConfigType)?.provider ?? "") as string) : "";
  }

  const providerLabelMapper: Record<string, string> = {
    openai: "OpenAI",
    googlegemini: "Google Gemini",
    openrouter: "OpenRouter",
    anthropic: "Anthropic",
    elevenlabs: "Elevenlabs",
  };

  const { openNodeConfig, setSelectedTab } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      openNodeConfig: state.openNodeConfig,
      setSelectedTab: state.setSelectedTab,
    })),
  );

  // Guarded: switching nodes flushes pending edits first, aborts on validation errors
  const guardNavigation = useDCPNavigationGuard();

  const openModelConfigTab = (nodeData: NodeDataType) => {
    setTimeout(() => {
      void getNodeConfig(nodeData.name).then((config) => {
        const modelField = config?.fields?.find((field: DCPFieldSchemaType) =>
          field.name.includes("__ModelConfig__"),
        );
        if (modelField?.category) setSelectedTab(modelField.category);
      });
    }, 100);
  };

  return (
    <>
      <div className="relative">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center cursor-pointer rounded-full border border-line-strong bg-surface hover:bg-hover",
            (connectedNodeData?.data?.isDisabled as NodeDataType) && "opacity-50",
            (connectedNodeData?.data?.isCut as NodeDataType) &&
              "border-dashed border-bad opacity-60",
          )}
          onDoubleClick={() => {
            if (!connectedNodeId || !connectedNodeData?.data) return;
            const nodeData = connectedNodeData.data as NodeDataType;
            void guardNavigation(() => {
              openNodeConfig(connectedNodeId, nodeData);
              openModelConfigTab(nodeData);
            });
          }}
        >
          <NodeImage
            className="!opacity-100  h-7 w-7 "
            src={getProviderBrandIcon(data?.label as string)}
          />
        </div>
        <NodeHeading className=" w-16">{providerLabelMapper[data?.label as string]}</NodeHeading>
      </div>

      <OutputHandle position={Position.Top} className="opacity-0" />
    </>
  );
});

ModelNode.displayName = "ModelNode";
