import { FlowTypesEnum } from "@avplatform/ui/enums";
import { buildFlowExportFileName } from "@avplatform/ui/utils";
import { Node } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { doesFlowContainAnyDesktopOnlyNode } from "@/features/react-flow/utils/has-desktop-nodes";
import {
  getVoiceAgentFirstSpeaker,
  getVoiceAgentIntroduction,
} from "@/features/react-flow/utils/voice-agent-graph.util";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";

import { useJsonDownload } from "./useJsonDownload.hook";

const CHAT_RECOMMENDED_ACTIONS_NODE_NAME = "CreateConversationAIAgent";
const CHAT_RECOMMENDED_ACTIONS_INPUT_KEY = "__RecommendedActionsConfig__Conversation";

// IMPORTANT NOTE: mirrors the Chat recommended-actions derivation in useSaveFlow; both writers
// must keep the same canvas keys so a round-trip through Import changes nothing.
const getChatDefaultActions = (nodes: Node[]): string[] =>
  (
    (
      nodes.find((node) => node.data?.name === CHAT_RECOMMENDED_ACTIONS_NODE_NAME)?.data as
        NodeDataType | undefined
    )?.inputs?.find((input) => input.key === CHAT_RECOMMENDED_ACTIONS_INPUT_KEY)?.value as
      { defaultActions?: string[] } | undefined
  )?.defaultActions ?? [];

export const useExportFlow = () => {
  const { downloadJson } = useJsonDownload();

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { nodes, edges, viewport, flowVariablesObject, inputOutputObject, flowType } =
    useReactFlowExtStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport,
        flowVariablesObject: state.flowVariablesObject,
        inputOutputObject: state.inputOutputObject,
        flowType: state.flowType,
      })),
    );

  const exportFlow = () => {
    const reactFlowObject = {
      nodes: nodes,
      edges: edges,
      viewport: viewport,
      flowVariablesObject,
      inputOutputObject,
      supportedPlatform: doesFlowContainAnyDesktopOnlyNode(nodes as Node<NodeDataType>[])
        ? "windows"
        : "cloud",
      ...(flowType === FlowTypesEnum.ChatAgent && { defaultActions: getChatDefaultActions(nodes) }),
      ...(flowType === FlowTypesEnum.VoiceAgent && {
        firstSpeaker: getVoiceAgentFirstSpeaker(nodes),
        voiceIntroduction: getVoiceAgentIntroduction(nodes),
      }),
    };

    downloadJson(
      {
        agent: {
          name: currentFlow?.name ?? "",
          type: currentFlow?.type ?? FlowTypesEnum.Agent,
          description: currentFlow?.description ?? "",
        },
        reactFlowObject,
      },
      buildFlowExportFileName(currentFlow?.name, currentFlow?.versionNumber),
    );
  };

  return { exportFlow };
};
