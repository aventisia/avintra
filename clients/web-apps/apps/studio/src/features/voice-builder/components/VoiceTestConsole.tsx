import { VoiceCallView } from "@avplatform/assistant-chat";
import { Badge } from "@avplatform/ui/badge";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useVoiceTestCall } from "../hooks/useVoiceTestCall.hook";

/** Studio test call: runs a real session against the draft agent. */
export const VoiceTestConsole = ({
  engineMode,
  modelLabel,
}: {
  engineMode?: "pipeline" | "realtime";
  modelLabel?: string;
}) => {
  const agentName = useCurrentFlowStore((state) => state.currentFlow.name) || "Agent";
  const isPublished = useCurrentFlowStore((state) => state.currentFlow.isPublished);

  const call = useVoiceTestCall();

  return (
    <VoiceCallView
      call={call}
      agentName={agentName}
      variant="panel"
      showDiagnostics
      startDisabled={isPublished}
      idleTitle="Call your agent"
      idleDescription={
        isPublished
          ? "This version is published. Open a draft version to run a test call."
          : undefined
      }
      header={
        <div className="flex flex-col gap-1 border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="mr-1 text-heading text-ink">Test call</h2>
            <Badge variant={isPublished ? "outline" : "primary"}>
              {isPublished ? "Published" : "Test mode"}
            </Badge>
            {engineMode && (
              <Badge variant="outline">{engineMode === "realtime" ? "Realtime" : "Pipeline"}</Badge>
            )}
          </div>
          <p className="text-hint text-muted-foreground">
            {isPublished
              ? "Published versions can no longer be tested."
              : "Live call with your draft agent. Tools run for real and the transcript is saved."}
          </p>
          {!isPublished && (
            <p className="text-hint text-muted-foreground">
              Draft version{modelLabel ? ` · ${modelLabel}` : ""}
            </p>
          )}
        </div>
      }
    />
  );
};
