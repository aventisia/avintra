import { useLiveVoiceCall } from "@avplatform/assistant-chat";
import { useState } from "react";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { isCanvasDirty, useSaveFlow } from "@/features/react-flow/hooks/useSaveFlow";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { createVoiceSession, endVoiceSession } from "../apis/voice-session.apis";

/** Studio test call: saves pending settings when the draft changed, then starts a real session. */
export const useVoiceTestCall = () => {
  const { saveData } = useSaveFlow();
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const call = useLiveVoiceCall({
    flowVersionId: useCurrentFlowStore((state) => state.currentFlow.versionId),
    mode: "test",
    prepare: async () => {
      await useDynamicConfigPanelStore.getState().flushForm?.();

      const { isSavePending, savedSnapshot, nodes, edges, flowVariablesObject } =
        useReactFlowExtStore.getState();
      const draftChanged = isCanvasDirty(savedSnapshot, isSavePending, {
        nodes,
        edges,
        flowVariablesObject: flowVariablesObject ?? [],
      });
      if (!draftChanged) return;

      setIsSavingDraft(true);
      try {
        const saved = await saveData();
        if (!saved) throw new Error("Save the agent before starting a test call.");
      } finally {
        setIsSavingDraft(false);
      }
    },
    createSession: async (request, signal) => {
      const response = await createVoiceSession(
        {
          ...request,
          flowVersionId: useCurrentFlowStore.getState().currentFlow.versionId,
          mode: "test",
        },
        signal,
      );

      if (!response.data)
        throw new Error(response.message || "Voice session could not be started.");
      return response.data;
    },
    endSession: endVoiceSession,
  });

  return { ...call, isSavingDraft };
};
