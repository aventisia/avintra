import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";

import { useShallow } from "zustand/react/shallow";

const TARGET_NODE_NAME = "CreateConversationAIAgent";
const INPUT_KEY = "__RecommendedActionsConfig__Conversation";

type RecommendActions = {
  defaultActions: string[];
  enableDynamicActions: boolean;
};

export const useDefaultActions = () => {
  return useReactFlowExtStore(
    useShallow((state) => {
      if (!state.isTestChatOpen || state.flowType !== FlowTypesEnum.ChatAgent) {
        return undefined;
      }

      const targetNode = state.nodes.find(
        (node) => node.data?.name === TARGET_NODE_NAME,
      );

      const nodeData = targetNode?.data as NodeDataType | undefined;

      return nodeData?.inputs?.find((input) => input.key === INPUT_KEY)
        ?.value as RecommendActions | undefined;
    }),
  );
};
