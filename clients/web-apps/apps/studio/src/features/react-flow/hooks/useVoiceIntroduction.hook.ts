import { ThreadMessageLike } from "@assistant-ui/react";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useMemo } from "react";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { getVoiceAgentOpeningMessage } from "../utils/voice-agent-graph.util";

/** Stable empty seed so non-voice flows never resize the chat runtime. */
const NO_MESSAGES: readonly ThreadMessageLike[] = [];

/**
 * Seeds the configured Voice AI introduction as the first assistant message.
 *
 * Returns no messages for human-first flows and for flows without an
 * introduction, so the caller always speaks first in those cases.
 */
export const useVoiceIntroduction = (): readonly ThreadMessageLike[] => {
  const flowType = useReactFlowExtStore((state) => state.flowType);
  const nodes = useReactFlowExtStore((state) => state.nodes);

  const openingMessage = useMemo(
    () => (flowType === FlowTypesEnum.VoiceAgent ? getVoiceAgentOpeningMessage(nodes) : ""),
    [flowType, nodes],
  );

  return useMemo(
    () =>
      openingMessage ? ([{ role: "assistant", content: openingMessage }] as const) : NO_MESSAGES,
    [openingMessage],
  );
};
