import { type VoiceCallScriptTurn, VoiceCallView } from "@avplatform/assistant-chat";
import { Badge } from "@avplatform/ui/badge";
import { useMemo } from "react";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { getVoiceAgentOpeningMessage } from "@/features/react-flow/utils/voice-agent-graph.util";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { VOICE_TEST_CALL_SCRIPT } from "../constants/voice-builder.constant";

const flushPendingSettings = () => void useDynamicConfigPanelStore.getState().flushForm?.();

/** Studio test call. Plays a sample conversation that opens with the configured introduction. */
export const VoiceTestConsole = ({ modelLabel }: { modelLabel?: string }) => {
  const agentName = useCurrentFlowStore((state) => state.currentFlow.name) || "Agent";
  const introduction = useReactFlowExtStore((state) => getVoiceAgentOpeningMessage(state.nodes));

  const script = useMemo<VoiceCallScriptTurn[]>(
    () =>
      introduction
        ? [
            {
              speaker: "agent",
              text: introduction,
              latency: { speechToTextMs: 0, firstTokenMs: 0, firstAudioMs: 650 },
            },
            ...VOICE_TEST_CALL_SCRIPT,
          ]
        : VOICE_TEST_CALL_SCRIPT,
    [introduction],
  );

  return (
    <VoiceCallView
      script={script}
      agentName={agentName}
      variant="panel"
      showDiagnostics
      onStart={flushPendingSettings}
      idleTitle="Call your agent"
      idleDescription="Plays a sample call with your latest settings. Live audio arrives in Phase 2."
      header={
        <div className="flex flex-col gap-1 border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="mr-1 text-heading text-ink">Test call</h2>
            <Badge variant="primary">Test mode</Badge>
            <Badge variant="outline">Pipeline</Badge>
            <Badge variant="draft">Simulated</Badge>
          </div>
          <p className="text-hint text-muted-foreground">
            {modelLabel ? `Draft version · ${modelLabel}` : "Draft version"} · history is not saved
          </p>
        </div>
      }
    />
  );
};
