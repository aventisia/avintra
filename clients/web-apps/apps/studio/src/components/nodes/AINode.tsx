import { FlowTypesEnum } from "@avplatform/ui/enums";
import { BrainIcon } from "@phosphor-icons/react";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useEffect } from "react";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { CHAT_AGENT_NODE_NAME } from "@/features/react-flow/utils/chat-agent-graph.util";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ModelConfigType } from "@/types/model-config-type";
import { NodeDataType, NodeInputType } from "@/types/node-data-type";

import { ModelInputHandle } from "../handles/ModelInputHandle";
import { NodeImage } from "../node-container/node-header/NodeImage";
import BaseNode from "./BaseNode";

type AINode = Node<NodeDataType, "aiNode">;

export const AINode = memo(
  ({ data, selected, sourcePosition, targetPosition, id }: NodeProps<AINode>) => {
    const { updateNodeData, updateNode, getNodes } = useReactFlow();

    useEffect(() => {
      if (data.type !== "aiNode") return;
      if (data.inputs) {
        const modelNode = getNodes().find((n) => n.type == "modelNode" && n?.parentId == id);
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
      const modelConfigItem = config?.find((item) => item.key.includes("__ModelConfig__"));

      if (!modelConfigItem) return [];

      const value = modelConfigItem.value as ModelConfigType;

      return value?.model ? [value.model] : [];
    }

    // ChatAgent flows have a fixed single node — the Chat AI node needs no
    // output handle since no downstream node can ever be connected.
    const flowType = useReactFlowExtStore((state) => state.flowType);
    const isChatAgentNode =
      flowType === FlowTypesEnum.ChatAgent && data.name === CHAT_AGENT_NODE_NAME;

    //Get llm for the selected model
    const llm = data.name.includes("AIAgent")
      ? getModel(data?.inputs)
      : (data?.selectedModel?.llMs as unknown as string[]);

    return (
      <BaseNode
        selected={selected}
        nodeData={data}
        nodeId={id}
        glyph={data.img ? <NodeImage src={data.img} /> : <BrainIcon />}
        kind={llm?.length ? `AI · ${llm.join(", ")}` : undefined}
      >
        <InputHandle position={targetPosition} id="main-in" />
        {!isChatAgentNode && <OutputHandle position={sourcePosition} id="main-out" />}
        <ModelInputHandle isConnectable={!!llm?.length} />
      </BaseNode>
    );
  },
);

AINode.displayName = "AINode";
