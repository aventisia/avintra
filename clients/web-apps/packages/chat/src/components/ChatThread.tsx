import { AuiIf, ThreadPrimitive, useAui, useAuiState } from "@assistant-ui/react";
import { Skeleton } from "@avplatform/ui";
import { ArrowDownIcon } from "@phosphor-icons/react";
import { type CSSProperties, type ReactNode, useMemo, useRef, useState } from "react";

import { ChatFileContext, type ChatFileHandlers } from "../constants/chat-file.constant";
import { ChatIntentContext } from "../constants/chat-intent.constant";
import { ChatThreadMountedAtContext } from "../constants/chat-thread-mounted-at.constant";
import type { ChatDestinationOption } from "../utils/chat-intent.util";
import { type ChatCommand } from "./ChatCommandMenu";
import { ChatComposer } from "./ChatComposer";
import { type ChatMention } from "./ChatMentionMenu";
import { ChatMessage } from "./ChatMessage";
import { type ChatStarterGroup, ChatStarters } from "./ChatStarters";

export type ChatThreadProps = {
  /** Shown above the composer while the thread is empty. */
  welcome?: ReactNode;
  /** Example prompts offered under the composer while the thread is empty. */
  starters?: readonly ChatStarterGroup[];
  /** Controls placed after the composer's attach button, such as a model picker. */
  composerTools?: ReactNode;
  /** Turns a voice recording into text; the microphone is hidden without it. */
  transcribe?: (audio: Blob) => Promise<string>;
  /** Offered when the message starts with `/`. */
  commands?: readonly ChatCommand[];
  /** Offered when the message contains `@`. */
  mentions?: readonly ChatMention[];
  /** Composer placeholder. */
  placeholder?: string;
  /** Pages the assistant may offer; a suggested page outside this list isn't shown. */
  destinations?: readonly ChatDestinationOption[];
  /** Opens a suggested page; without it no page is offered. */
  onNavigate?: (route: string) => void;
  /** Turns files in replies into cards; without it they render as code. */
  files?: ChatFileHandlers;
};

const columnStyle = { "--chat-column": "46rem" } as CSSProperties;

const NO_DESTINATIONS: readonly ChatDestinationOption[] = [];

const ScrollToLatest = () => (
  <ThreadPrimitive.ScrollToBottom
    aria-label="Scroll to latest message"
    className="absolute -top-12 left-1/2 inline-flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink-2 shadow-[0_4px_16px_-6px_rgb(0_0_0/0.2)] transition-opacity hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:invisible disabled:opacity-0 dark:bg-fill"
  >
    <ArrowDownIcon weight="bold" className="size-4" />
  </ThreadPrimitive.ScrollToBottom>
);

const ThreadSkeleton = () => (
  <div
    role="status"
    aria-label="Loading chat"
    className="mx-auto w-full max-w-[var(--chat-column)] flex-1 space-y-8 pt-8 delay-300 duration-300 animate-in fade-in-0 fill-mode-backwards"
  >
    <Skeleton className="ml-auto h-11 w-2/5 rounded-3xl" />
    <div className="space-y-2.5">
      <Skeleton className="h-4 w-11/12 rounded" />
      <Skeleton className="h-4 w-4/5 rounded" />
      <Skeleton className="h-4 w-3/5 rounded" />
    </div>
  </div>
);

const RunAnnouncer = () => {
  const hasReply = useAuiState((s) => !s.thread.isRunning && !s.thread.isEmpty);
  return (
    <div aria-live="polite" className="sr-only">
      {hasReply ? "Response ready" : ""}
    </div>
  );
};

/**
 * Full-height chat thread for the runtime above it: a centred reading column,
 * top-anchored turns, and a sticky composer that starts mid-screen while the
 * thread is empty. The host owns the runtime.
 */
export const ChatThread = ({
  welcome,
  starters,
  composerTools,
  transcribe,
  commands,
  mentions,
  placeholder = "Message",
  destinations = NO_DESTINATIONS,
  onNavigate,
  files,
}: ChatThreadProps) => {
  const [mountedAt] = useState(Date.now);
  const aui = useAui();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fillComposer = (prompt: string) => {
    aui.composer.setText(prompt);
    inputRef.current?.focus();
  };

  const intent = useMemo(() => ({ destinations, onNavigate }), [destinations, onNavigate]);

  return (
    <ChatFileContext.Provider value={files ?? null}>
      <ChatIntentContext.Provider value={intent}>
        <ChatThreadMountedAtContext.Provider value={mountedAt}>
          <ThreadPrimitive.Root
            data-chat
            style={columnStyle}
            className="flex h-full min-h-0 flex-col bg-surface text-ink dark:bg-bg"
          >
            <ThreadPrimitive.Viewport
              data-chat-transcript
              turnAnchor="top"
              scrollToBottomOnInitialize
              scrollToBottomOnThreadSwitch
              className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-4 [scrollbar-gutter:stable] sm:px-6"
            >
              <AuiIf condition={(s) => s.thread.isLoading && s.thread.messages.length === 0}>
                <ThreadSkeleton />
              </AuiIf>
              <AuiIf condition={(s) => s.thread.isEmpty}>
                <div className="mx-auto flex w-full max-w-[var(--chat-column)] flex-1 flex-col justify-end pb-10 pt-10">
                  {welcome}
                </div>
              </AuiIf>
              <ThreadPrimitive.Messages>{() => <ChatMessage />}</ThreadPrimitive.Messages>
              <ThreadPrimitive.ViewportFooter
                data-chat-print-hide
                className="sticky bottom-0 mx-auto mt-auto w-full max-w-[var(--chat-column)] bg-surface pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-10 before:bg-gradient-to-t before:from-surface before:to-transparent dark:bg-bg dark:before:from-bg sm:pb-6"
              >
                <ScrollToLatest />
                <ChatComposer
                  placeholder={placeholder}
                  inputRef={inputRef}
                  tools={composerTools}
                  transcribe={transcribe}
                  commands={commands}
                  mentions={mentions}
                />
              </ThreadPrimitive.ViewportFooter>
              <AuiIf condition={(s) => s.thread.isEmpty}>
                <div className="mx-auto w-full max-w-[var(--chat-column)] flex-1 pb-10">
                  {starters && <ChatStarters groups={starters} onPick={fillComposer} />}
                </div>
              </AuiIf>
            </ThreadPrimitive.Viewport>
            <RunAnnouncer />
          </ThreadPrimitive.Root>
        </ChatThreadMountedAtContext.Provider>
      </ChatIntentContext.Provider>
    </ChatFileContext.Provider>
  );
};
