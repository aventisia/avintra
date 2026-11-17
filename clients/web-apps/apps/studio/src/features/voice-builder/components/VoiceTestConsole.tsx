import { VoiceCallView } from "@avplatform/assistant-chat";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { PhoneIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { DetailPaneHeader } from "@/components/panel/components/DetailPaneHeader";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { VOICE_ENGINE_LABELS } from "../constants/voice-builder.constant";
import { useVoicePendingChecks } from "../hooks/useVoicePendingChecks.hook";
import { useVoiceTestCall } from "../hooks/useVoiceTestCall.hook";
import { useVoiceBuilderStore } from "../stores/voice-builder.store";
import type { VoiceEngineMode } from "../types/voice-builder.type";
import { formatPendingSections } from "../utils/voice-builder.util";

/** Studio test call: runs a real session against the draft agent. */
export const VoiceTestConsole = ({
  engineMode,
  modelLabel,
}: {
  engineMode?: VoiceEngineMode;
  modelLabel?: string;
}) => {
  const agentName = useCurrentFlowStore((state) => state.currentFlow.name) || "Agent";
  const isPublished = useCurrentFlowStore((state) => state.currentFlow.isPublished);
  const pendingChecks = useVoicePendingChecks();
  const configRevision = useVoiceBuilderStore((state) => state.configRevision);
  const setActiveSection = useVoiceBuilderStore((state) => state.setActiveSection);
  const [errorRevision, setErrorRevision] = useState<number | null>(null);

  const call = useVoiceTestCall();

  useEffect(() => {
    setErrorRevision(call.error ? useVoiceBuilderStore.getState().configRevision : null);
  }, [call.error]);

  const isErrorStale =
    call.state === "error" && errorRevision !== null && configRevision !== errorRevision;
  const shownCall = isErrorStale ? { ...call, state: "idle" as const, error: null } : call;
  const isIncomplete = !isPublished && pendingChecks.length > 0;
  const subtitle = [
    isPublished ? "Published version" : "Draft version",
    engineMode && VOICE_ENGINE_LABELS[engineMode],
    modelLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <VoiceCallView
      call={shownCall}
      agentName={agentName}
      variant="panel"
      showDiagnostics
      startDisabled={isPublished || isIncomplete}
      idleTitle={isIncomplete ? "Finish setup to test" : "Call your agent"}
      idleDescription={
        isPublished
          ? "Published versions can no longer be tested. Open a draft version to run a test call."
          : isIncomplete
            ? `Complete ${formatPendingSections(pendingChecks)} before starting a call.`
            : "A live call with your draft agent. Tools run for real and the transcript is saved."
      }
      idleAction={
        isIncomplete ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveSection(pendingChecks[0].section)}
          >
            Go to {pendingChecks[0].label}
          </Button>
        ) : undefined
      }
      header={
        <DetailPaneHeader
          Icon={PhoneIcon}
          eyebrow={subtitle}
          title="Test call"
          aside={!isPublished && <Badge variant="draft">Draft</Badge>}
          className="px-4"
        />
      }
    />
  );
};
