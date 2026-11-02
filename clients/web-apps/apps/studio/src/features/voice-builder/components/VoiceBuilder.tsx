import { EmptyState, LoadingSpinner } from "@avplatform/ui";
import { AudioLines } from "lucide-react";
import { useEffect } from "react";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";

import { VoiceBuilderForm } from "./VoiceBuilderForm";

/** Points the node config form at the agent's voice node, then shows the builder. */
export const VoiceBuilder = () => {
  const voiceNodeId = useReactFlowExtStore(
    (state) => state.nodes.find((node) => node.data?.name === VOICE_AGENT_NODE_NAME)?.id,
  );
  const boundNodeId = useDynamicConfigPanelStore((state) =>
    state.nodeData?.name === VOICE_AGENT_NODE_NAME ? state.nodeId : undefined,
  );

  useEffect(() => {
    const node = useReactFlowExtStore.getState().nodes.find(({ id }) => id === voiceNodeId);
    if (!node) return;
    const { setNodeId, setNodeData } = useDynamicConfigPanelStore.getState();
    setNodeId(node.id);
    setNodeData(node.data as NodeDataType);
  }, [voiceNodeId]);

  if (!voiceNodeId) {
    return (
      <EmptyState
        Icon={AudioLines}
        primaryMessage="No voice settings found"
        secondaryMessage="This agent has no voice node to configure."
      />
    );
  }

  if (boundNodeId !== voiceNodeId) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="size-5 text-primary" />
      </div>
    );
  }

  return <VoiceBuilderForm />;
};
