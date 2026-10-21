import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { type FC, useEffect, useState } from "react";

import { useVoiceAssistantContext } from "../hooks/useVoiceAssistantContext.hook";
import { useVoicePlaybackStore } from "../stores/voice-playback.store";
import { UNKNOWN_VOICE_CONFIG_NOTICE } from "../utils/voice-notices.util";
import {
  VOICE_ENGINE_LABEL,
  type VoiceEngine,
  resolveSessionRecoveryLabel,
} from "../utils/voice-session.util";

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

type VoiceStatusNoticeProps = {
  /** Per-capability reasons the agent cannot start a voice session yet. */
  notConfiguredReasons: string[];
  /** Engine the agent resolves to before a session starts. */
  engineMode: VoiceEngine;
  pipelineReady: boolean;
  realtimeReady: boolean;
};

/** Session errors, recovery actions, and configuration notices for the voice surface. */
export const VoiceStatusNotice: FC<VoiceStatusNoticeProps> = ({
  notConfiguredReasons,
  engineMode,
  pipelineReady,
  realtimeReady,
}) => {
  const voice = useVoiceAssistantContext();
  const playBlocked = useVoicePlaybackStore((state) => state.playBlocked);
  const resume = useVoicePlaybackStore((state) => state.resume);
  const isOnline = useOnlineStatus();

  if (!voice) return null;

  const { sessionError, realtimeInterimTranscript, ttsError } = voice;
  const recoveryLabel = sessionError ? resolveSessionRecoveryLabel(sessionError.kind) : null;
  const hasContent =
    Boolean(sessionError) ||
    Boolean(realtimeInterimTranscript) ||
    Boolean(ttsError) ||
    playBlocked ||
    !isOnline ||
    notConfiguredReasons.length > 0;

  if (!hasContent) return null;

  const engineTags: Array<{ engine: VoiceEngine; ready: boolean }> = [
    { engine: "pipeline", ready: pipelineReady },
    { engine: "realtime", ready: realtimeReady },
  ];

  return (
    <div className="aui-voice-status mb-2 flex flex-col gap-1 rounded-md border bg-muted/40 px-3 py-2 text-muted-foreground text-xs">
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
      {notConfiguredReasons.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span>Voice engines:</span>
            {engineTags.map(({ engine, ready }) => (
              <span
                key={engine}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium",
                  !ready && "opacity-50",
                  engine === engineMode && "border-primary/40 text-primary",
                )}
              >
                {VOICE_ENGINE_LABEL[engine]}
              </span>
            ))}
          </div>
          {notConfiguredReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
          <p>{UNKNOWN_VOICE_CONFIG_NOTICE}</p>
        </div>
      )}
    </div>
  );
};
