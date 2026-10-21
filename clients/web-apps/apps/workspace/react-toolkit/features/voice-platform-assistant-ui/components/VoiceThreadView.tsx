import {
  AuiIf,
  ErrorPrimitive,
  MessagePrimitive,
  SuggestionPrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { Button } from "@avplatform/ui/buttons";
import { type FC } from "react";

import { useVoiceAssistantContext } from "../hooks/useVoiceAssistantContext.hook";
import type { VoiceEngine } from "../utils/voice-session.util";
import { VoiceSessionControls } from "./VoiceSessionControls";
import { VoiceStatusNotice } from "./VoiceStatusNotice";

const SIMULATED_TOOL_EVENT_COPY =
  "Simulated action in this voice session — no real effect. External actions need a proper test environment.";

export type VoiceThreadViewProps = {
  title?: string;
  description?: string;
  badge?: string;
  notConfiguredReasons: string[];
  engineMode: VoiceEngine;
  pipelineReady: boolean;
  realtimeReady: boolean;
};

/** Read-only voice transcript with the session controls below it. */
export const VoiceThreadView: FC<VoiceThreadViewProps> = ({
  title,
  description,
  badge,
  notConfiguredReasons,
  engineMode,
  pipelineReady,
  realtimeReady,
}) => (
  <ThreadPrimitive.Root
    className="aui-root aui-thread-root flex h-full flex-col bg-background"
    style={{
      ["--thread-max-width" as string]: "60rem",
      ["--composer-radius" as string]: "0.5rem",
      ["--composer-padding" as string]: "10px",
    }}
  >
    <VoiceThreadHeader title={title} badge={badge} />

    <ThreadPrimitive.Viewport
      turnAnchor="top"
      scrollToBottomOnRunStart
      scrollToBottomOnThreadSwitch
      scrollToBottomOnInitialize
      className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-4"
    >
      <AuiIf condition={(s) => s.thread.isEmpty}>
        <VoiceWelcome title={title} description={description} badge={badge} />
      </AuiIf>

      <ThreadPrimitive.Messages>{() => <VoiceMessage />}</ThreadPrimitive.Messages>

      <VoiceInterimMessages />
    </ThreadPrimitive.Viewport>

    <div className="flex w-full shrink-0 flex-col px-4 pt-3">
      <VoiceSessionControls startDisabledReason={notConfiguredReasons[0] ?? null} />
      <VoiceStatusNotice
        notConfiguredReasons={notConfiguredReasons}
        engineMode={engineMode}
        pipelineReady={pipelineReady}
        realtimeReady={realtimeReady}
      />
    </div>
  </ThreadPrimitive.Root>
);

const VoiceThreadHeader: FC<{ title?: string; badge?: string }> = ({ title, badge }) => (
  <div className="aui-thread-header flex w-full shrink-0 items-center gap-2 border-b px-4 py-2">
    <span className="truncate text-sm font-medium">{title ?? "Voice"}</span>
    {badge && (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        {badge}
      </span>
    )}
  </div>
);

const VoiceWelcome: FC<{ title?: string; description?: string; badge?: string }> = ({
  title,
  description,
  badge,
}) => {
  const welcomeDescription = `${description?.trim() ? `${description.trim()}. ` : ""}Start a session to talk hands-free.`;

  return (
    <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] grow flex-col">
      <div className="aui-thread-welcome-center flex w-full grow flex-col items-center justify-center">
        <div className="aui-thread-welcome-message gap-1 flex size-full flex-col justify-center items-center px-4">
          {badge && (
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              {badge}
            </span>
          )}
          <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-semibold text-xl duration-200 capitalize">
            {title ?? "Voice"}
          </h1>
          <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-base delay-75 duration-200">
            {welcomeDescription}
          </p>
        </div>
      </div>
      <VoiceSuggestions />
    </div>
  );
};

const VoiceSuggestions: FC = () => (
  <div className="aui-thread-welcome-suggestions flex gap-2 pb-4 w-full flex-wrap">
    <ThreadPrimitive.Suggestions>{() => <VoiceSuggestionItem />}</ThreadPrimitive.Suggestions>
  </div>
);

const VoiceSuggestionItem: FC = () => (
  <div className="aui-thread-welcome-suggestion-display fade-in slide-in-from-bottom-2 animate-in fill-mode-both duration-200 [&:nth-child(n+3)]:hidden md:[&:nth-child(n+3)]:block">
    <SuggestionPrimitive.Trigger send asChild>
      <Button
        variant="outline"
        className="aui-thread-welcome-suggestion h-auto flex-wrap items-start justify-start gap-1 rounded-full border bg-background px-3.5 py-2 text-left text-sm transition-colors hover:bg-muted md:flex-col"
      >
        <SuggestionPrimitive.Title className="aui-thread-welcome-suggestion-text-1 italic leading-tight text-wrap font-medium" />
        <SuggestionPrimitive.Description className="aui-thread-welcome-suggestion-text-2 text-muted-foreground empty:hidden" />
      </Button>
    </SuggestionPrimitive.Trigger>
  </div>
);

const VoiceMessage: FC = () => {
  const role = useAuiState((s) => s.message.role);

  return role === "user" ? <VoiceUserMessage /> : <VoiceAssistantMessage />;
};

const VoiceInterimMessages: FC = () => {
  const voice = useVoiceAssistantContext();
  const userInterim = voice?.realtimeUserInterimTranscript ?? "";
  const assistantInterim = voice?.realtimeAssistantInterimTranscript ?? "";

  return (
    <>
      {userInterim && (
        <div
          key="realtime-interim-user"
          className="aui-user-message-root text-sm fade-in slide-in-from-bottom-1 mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 py-3 duration-150 [&:where(>*)]:col-start-2"
          data-role="user"
          aria-label="Interim user transcript"
          aria-live="polite"
        >
          <div className="aui-user-message-content-wrapper col-start-2 min-w-0">
            <div className="aui-user-message-content wrap-break-word rounded-2xl bg-muted px-4 py-2.5 text-foreground italic opacity-80">
              {userInterim}
            </div>
          </div>
        </div>
      )}
      {assistantInterim && (
        <div
          key="realtime-interim-assistant"
          className="aui-assistant-message-root text-sm fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-3 duration-150 !min-h-fit !h-fit"
          data-role="assistant"
          aria-label="Interim assistant transcript"
          aria-live="polite"
        >
          <div className="aui-assistant-message-content wrap-break-word px-2 text-foreground italic leading-relaxed opacity-80">
            <p className="whitespace-pre-wrap">{assistantInterim}</p>
          </div>
        </div>
      )}
    </>
  );
};

const VoiceUserMessage: FC = () => (
  <MessagePrimitive.Root
    className="aui-user-message-root text-sm fade-in slide-in-from-bottom-1 mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 py-3 duration-150 [&:where(>*)]:col-start-2"
    data-role="user"
  >
    <div className="aui-user-message-content-wrapper col-start-2 min-w-0">
      <div className="aui-user-message-content wrap-break-word rounded-2xl bg-muted px-4 py-2.5 text-foreground empty:hidden">
        <MessagePrimitive.Parts />
      </div>
    </div>
  </MessagePrimitive.Root>
);

const VoiceAssistantMessage: FC = () => (
  <MessagePrimitive.Root
    className="aui-assistant-message-root text-sm fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-3 duration-150 !min-h-fit !h-fit"
    data-role="assistant"
  >
    <div className="aui-assistant-message-content wrap-break-word px-2 text-foreground leading-relaxed">
      <MessagePrimitive.Parts>
        {({ part }) => {
          if (part.type === "text") {
            if (!part.text || part.text.trim() === "") return null;
            return <p className="whitespace-pre-wrap">{part.text}</p>;
          }
          if (part.type === "tool-call") {
            return (
              <div className="my-1 w-full">
                <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-medium text-[11px] text-amber-700 dark:text-amber-300">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Simulated
                </span>
                <p className="text-xs text-muted-foreground">{part.toolName}</p>
                <p className="mt-1 text-amber-700 text-xs dark:text-amber-300">
                  {SIMULATED_TOOL_EVENT_COPY}
                </p>
              </div>
            );
          }
          return null;
        }}
      </MessagePrimitive.Parts>
      <MessageError />
    </div>
  </MessagePrimitive.Root>
);

const MessageError: FC = () => (
  <MessagePrimitive.Error>
    <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
      <ErrorPrimitive.Message className="aui-message-error-line-clamp-2" />
    </ErrorPrimitive.Root>
  </MessagePrimitive.Error>
);
