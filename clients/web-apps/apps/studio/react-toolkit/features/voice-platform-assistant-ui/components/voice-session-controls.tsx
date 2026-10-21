import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Mic, SquareIcon } from "lucide-react";
import { type FC, useEffect, useState } from "react";

import { useVoiceAssistantContext } from "../hooks/useVoiceAssistantContext.hook";
import { VOICE_ENGINE_LABEL, VOICE_SESSION_STATE_LABEL } from "../utils/voice-session.util";

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

/** Start/End controls, session state, and engine tag for the Voice Test surface. */
export const VoiceSessionControls: FC = () => {
  const voice = useVoiceAssistantContext();
  const isOnline = useOnlineStatus();

  if (!voice) return null;

  const isActive = voice.isVoiceSessionActive;
  const isConnecting = voice.sessionState === "connecting";
  const engine = isActive ? voice.sessionEngine : voice.configuredSessionEngine;
  const isReconnecting = voice.sessionState === "reconnecting";

  return (
    <div className="aui-voice-session-controls mb-2 flex flex-col gap-2 rounded-md border bg-background px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          type="button"
          size="sm"
          variant={isActive ? "outline" : "default"}
          className="aui-voice-session-toggle"
          onClick={isActive ? voice.endSession : voice.startSession}
        >
          {isActive ? <SquareIcon className="size-3.5" /> : <Mic className="size-3.5" />}
          {isActive ? "End Session" : "Start Session"}
        </Button>

        <span
          className="aui-voice-session-state inline-flex items-center gap-1.5 text-sm font-medium"
          aria-live="polite"
        >
          <span
            className={cn(
              "size-2 rounded-full",
              isReconnecting
                ? "animate-pulse bg-amber-500"
                : isActive
                  ? "animate-pulse bg-emerald-500"
                  : "bg-muted-foreground/50",
            )}
          />
          {VOICE_SESSION_STATE_LABEL[voice.sessionState]}
        </span>

        <span className="aui-voice-session-engine inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {VOICE_ENGINE_LABEL[engine]}
        </span>

        <span
          className={cn(
            "aui-voice-session-connection inline-flex items-center gap-1.5 text-xs",
            isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
          )}
        >
          <span
            className={cn("size-1.5 rounded-full", isOnline ? "bg-emerald-500" : "bg-destructive")}
          />
          {isOnline ? "Connected" : "Offline"}
        </span>
      </div>

      {isConnecting && (
        <p className="text-muted-foreground text-xs">Allow the microphone to begin speaking.</p>
      )}
    </div>
  );
};
