import { VoiceCallView } from "@avplatform/assistant-chat";
import { Badge } from "@avplatform/ui/badge";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useVoiceTestCall } from "../hooks/useVoiceTestCall.hook";

/** Studio test call: runs a real session against the draft agent. */
export const VoiceTestConsole = ({ modelLabel }: { modelLabel?: string }) => {
  const agentName = useCurrentFlowStore((state) => state.currentFlow.name) || "Agent";

  const call = useVoiceTestCall();

  return (
    <VoiceCallView
      call={call}
      agentName={agentName}
      variant="panel"
      showDiagnostics
      idleTitle="Call your agent"
      header={
        <div className="flex flex-col gap-1 border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="mr-1 text-heading text-ink">Test call</h2>
            <Badge variant="primary">Test mode</Badge>
            <Badge variant="outline">Pipeline</Badge>
          </div>
          <p className="text-hint text-muted-foreground">
            Live call with your draft agent. Tools run for real; the transcript is not saved.
          </p>
          <p className="text-hint text-muted-foreground">
            Draft version{modelLabel ? ` · ${modelLabel}` : ""}
          </p>
        </div>
      }
    />
  );
};
