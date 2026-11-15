import { useLiveVoiceCall } from "@avplatform/assistant-chat";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { useSaveFlow } from "@/features/react-flow/hooks/useSaveFlow";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { createVoiceSession } from "../apis/voice-session.apis";

/** Studio test call: saves pending settings, then starts a real session for the open version. */
export const useVoiceTestCall = () => {
  const { saveData } = useSaveFlow();

  return useLiveVoiceCall({
    flowVersionId: useCurrentFlowStore((state) => state.currentFlow.versionId),
    mode: "test",
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
