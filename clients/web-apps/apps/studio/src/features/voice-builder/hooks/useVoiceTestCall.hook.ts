import { type VoiceCaptionTurn, useLiveVoiceCall } from "@avplatform/assistant-chat";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { useSaveFlow } from "@/features/react-flow/hooks/useSaveFlow";
import { getVoiceAgentOpeningMessage } from "@/features/react-flow/utils/voice-agent-graph.util";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { createVoiceSession } from "../apis/voice-session.apis";

const INTRODUCTION_TURN_ID = "introduction";

const getIntroductionTurns = (): VoiceCaptionTurn[] => {
  const introduction = getVoiceAgentOpeningMessage(useReactFlowExtStore.getState().nodes);
  return introduction ? [{ id: INTRODUCTION_TURN_ID, speaker: "agent", text: introduction }] : [];
};

/** Studio test call: saves pending settings, then starts a real session for the open version. */
export const useVoiceTestCall = () => {
  const { saveData } = useSaveFlow();

  return useLiveVoiceCall({
    flowVersionId: useCurrentFlowStore((state) => state.currentFlow.versionId),
    mode: "test",
    initialTurns: getIntroductionTurns,
    createSession: async (request) => {
      await useDynamicConfigPanelStore.getState().flushForm?.();
      const saved = await saveData();
      if (!saved) throw new Error("Save the agent before starting a test call.");

      const response = await createVoiceSession({
        ...request,
        flowVersionId: useCurrentFlowStore.getState().currentFlow.versionId,
        mode: "test",
      });

      if (!response.data)
        throw new Error(response.message || "Voice session could not be started.");
      return response.data;
    },
  });
};
