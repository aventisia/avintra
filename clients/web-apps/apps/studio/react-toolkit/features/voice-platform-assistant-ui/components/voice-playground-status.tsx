import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { type FC, useEffect, useMemo, useState } from "react";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { useVoiceAssistantContext } from "../hooks/useVoiceAssistantContext.hook";
import { useVoicePlaybackStore } from "../stores/voice-playback.store";
import {
  SUPPRESSED_WEBHOOK_NOTICE,
  getPlaygroundNotices,
  getVoiceAgentPlaygroundInputs,
} from "../utils/voice-playground-info.util";
import { resolveSessionRecoveryLabel } from "../utils/voice-session.util";

export const SIMULATED_TOOL_BADGE_LABEL = "Test mode";

export const SIMULATED_TOOL_EVENT_COPY =
  "Simulated action in the Test \u2014 no real effect. Telephone transfer and other external actions need a proper test environment.";

/** Marks a rendered action as simulated inside the Voice Test. */
export const SimulatedToolBadge: FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn(
      "mb-1 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-medium text-[11px] text-amber-700 dark:text-amber-300",
      className,
    )}
  >
    <span className="size-1.5 rounded-full bg-amber-500" />
    {SIMULATED_TOOL_BADGE_LABEL}
  </span>
);

const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

/** Session errors, recovery actions, and Test notices for the Voice Test panel. */
export const VoicePlaygroundStatus: FC = () => {
  const voice = useVoiceAssistantContext();
  const nodes = useReactFlowExtStore((state) => state.nodes);
  const playBlocked = useVoicePlaybackStore((state) => state.playBlocked);
  const resume = useVoicePlaybackStore((state) => state.resume);
  const isOnline = useOnlineStatus();
  const notices = useMemo(
    () => getPlaygroundNotices(getVoiceAgentPlaygroundInputs(nodes)),
    [nodes],
  );

  if (!voice) return null;

  const { sessionError, realtimeInterimTranscript, ttsError } = voice;
  const recoveryLabel = sessionError ? resolveSessionRecoveryLabel(sessionError.kind) : null;
  const hasContent =
    Boolean(sessionError) ||
    Boolean(realtimeInterimTranscript) ||
    Boolean(ttsError) ||
    playBlocked ||
    !isOnline ||
    notices.webhookConfigured ||
    notices.deferred.length > 0;

  if (!hasContent) return null;

  return (
    <div className="aui-voice-test-status mb-2 flex flex-col gap-1 rounded-md border bg-muted/40 px-3 py-2 text-muted-foreground text-xs">
      {realtimeInterimTranscript && (
        <p
          className="aui-voice-interim-transcript italic opacity-80"
          aria-live="polite"
          aria-label="Interim transcript, not final"
        >
          {`Hearing… (interim — not final): ${realtimeInterimTranscript}`}
        </p>
      )}
      {!isOnline && sessionError?.kind !== "offline" && (
        <p>
          Connection lost — check your network, then retry. Reload the page if it stays offline.
        </p>
      )}
      {sessionError && (
        <div className="flex flex-wrap items-center gap-2 text-destructive">
          <span>{sessionError.message}</span>
          {!voice.pipelineSwitchOffered && recoveryLabel && (
            <Button type="button" size="xs" variant="outline" onClick={voice.retrySessionError}>
              {recoveryLabel}
            </Button>
          )}
          {voice.pipelineSwitchOffered && (
            <>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={voice.switchToPipelineForSession}
              >
                Switch to Pipeline for this session
              </Button>
              <Button type="button" size="xs" variant="ghost" onClick={voice.retrySessionError}>
                Stay on Realtime
              </Button>
            </>
          )}
        </div>
      )}
      {ttsError && (
        <div className="flex flex-wrap items-center gap-2 text-destructive">
          <span>{ttsError.message}</span>
          <Button type="button" size="xs" variant="outline" onClick={voice.retryLastReply}>
            Retry reply
          </Button>
        </div>
      )}
      {playBlocked && (
        <Button type="button" size="xs" variant="outline" onClick={resume}>
          Tap to resume audio
        </Button>
      )}
      {notices.webhookConfigured && <p>{SUPPRESSED_WEBHOOK_NOTICE}</p>}
      {notices.deferred.length > 0 && (
        <p>{`Not available in the Test: ${notices.deferred.join(", ")}.`}</p>
      )}
    </div>
  );
};
