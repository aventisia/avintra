import {
  AssistantRuntimeProvider,
  AuiConfig,
  AuiProvider,
  SuggestionAdapter,
  Suggestions,
  ThreadMessageLike,
  useAui,
  useLocalRuntime,
} from "@assistant-ui/react";
import { createAssistantUIModelAdapter } from "@avplatform/assistant-chat";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCurrentFlowStore } from "@/stores/current-flow-store";
import type { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";
import { getStudioSpaceHeaders } from "@/utils/space-headers";

// API imports are kept as they are internal domain logic for this specific feature
import { createHistoryAdapter } from "../adapters/history-adaptor";
import { insertConversation } from "../apis/assist-conversations-apis";
import { useThreadConfigStore } from "../stores/assitant-ui-store";
import {
  AssistantVoiceContext,
  AssistantVoiceContextValue,
} from "../voice/context/assistant-voice.context";
import { useAssistantVoice } from "../voice/hooks/useAssistantVoice.hook";
import { useChatAgentVoiceConfig } from "../voice/hooks/useChatAgentVoiceConfig.hook";
import { useVoiceIntroSpeech } from "../voice/hooks/useVoiceIntroSpeech.hook";
import { useVoicePipelineEngine } from "../voice/hooks/useVoicePipelineEngine.hook";
import { useVoiceRealtimeEngine } from "../voice/hooks/useVoiceRealtimeEngine.hook";
import { useVoiceSession } from "../voice/hooks/useVoiceSession.hook";
import { useVoicePlaybackStore } from "../voice/stores/voice-playback.store";
import { Thread } from "./thread";

export interface AvPlatformAssistantUIProps {
  /**
   * Operational mode:
   * 'production': Persists to the database. Lazily allocates a conversation ID on first message.
   * 'temporary': Ephemeral dev/test mode. Bypasses history storage entirely.
   */
  mode?: "production" | "temporary";
  /** Explicit flow version ID (Required). */
  flowVersionId: string;
  /** Explicit conversation ID. If omitted in 'production', a new one is requested lazily. */
  conversationId?: string;
  /** If true, blocks new message creation and only loads historical logs. */
  readOnly?: boolean;
  /** Replaces the generic read-only notice with caller-specific copy. */
  readOnlyMessage?: string;
  /** Archival visual state flag. */
  archived?: boolean;
  /** Visual thread title. */
  title?: string;
  /** Small pill rendered above the thread title (e.g. environment/mode). */
  badge?: string;
  /** Visual thread description. */
  description?: string;
  /** Optional fallback suggestions for empty threads. */
  defaultActions?: string[];
  /** Injected historical messages. */
  initialMessages?: readonly ThreadMessageLike[];
  /** Renders the Voice Test controls, status, and simulated-action notices. */
  isVoicePlayground?: boolean;
  /**
   * When true, renders a header action that starts a fresh chat session,
   * discarding the in-memory messages of the current session.
   */
  allowNewSession?: boolean;
  /** Callback fired when a new chat session is allocated lazily. Parent should update the URL/state. */
  onConversationAllocated?: (newConversationId: string) => void;
  /** Callback fired when a workflow execution completes. */
  onRequestComplete?: () => void;
  /** Styling wrapper classes. */
  className?: string;
}

/**
 * Universal Standalone Chat Assistant Interface.
 * 100% decoupled from global stores, routers, and query clients.
 */
export const AvPlatformAssistantUI = ({
  mode = "production",
  flowVersionId,
  conversationId,
  readOnly = false,
  archived = false,
  allowNewSession = false,
  defaultActions = [],
  className = "flex h-full flex-col w-full bg-background",
  onConversationAllocated,
  onRequestComplete,
  ...props
}: AvPlatformAssistantUIProps) => {
  const { setConfig } = useThreadConfigStore();

  useEffect(() => {
    if (archived || readOnly) {
      setConfig({ archived, readOnly });
    } else {
      setConfig({ archived: false, readOnly: false });
    }
  }, [archived, readOnly, setConfig]);

  // Track active DB conversation internally.
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(
    conversationId,
  );

  // 1. Append a unique key to ensure the initial empty session is uniquely keyed
  const [sessionKey, setSessionKey] = useState<string>(
    conversationId || `new-session-${window.crypto.randomUUID()}`,
  );

  // Sync internal state if the parent swaps the ID via props (chat switching)
  useEffect(() => {
    if (conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
      // 2. Generate a fresh key whenever navigating to an empty conversation state
      setSessionKey(conversationId || `new-session-${window.crypto.randomUUID()}`);
    }
  }, [conversationId, activeConversationId]);

  // 3. Re-key the runtime to discard the current in-memory session and start fresh.
  const handleNewSession = useCallback(() => {
    useVoicePlaybackStore.getState().stop();
    setSessionKey(`new-session-${window.crypto.randomUUID()}`);
  }, []);

  return (
    <div className={className}>
      <RuntimeWrapper
        key={`${mode}-${flowVersionId}-${sessionKey}`}
        mode={mode}
        conversationId={activeConversationId}
        flowVersionId={flowVersionId}
        readOnly={readOnly}
        archived={archived}
        allowNewSession={allowNewSession}
        defaultActions={defaultActions}
        onRequestComplete={onRequestComplete}
        onNewSession={handleNewSession}
        // Bubble the lazy allocation event up, and set it to internal state
        onConversationAllocated={(newId) => {
          setActiveConversationId(newId);
          onConversationAllocated?.(newId);
        }}
        {...props}
      />
    </div>
  );
};

// --- Internal Context Wrapper ---

type RuntimeWrapperProps = Omit<
  AvPlatformAssistantUIProps,
  "className" | "onConversationAllocated"
> & {
  conversationId?: string;
  onConversationAllocated?: (newId: string) => void;
  /** Internal handler that re-keys the runtime to start a fresh session. */
  onNewSession?: () => void;
};

/**
 * Context isolation wrapper. Hooks into assistant-ui's React Contexts safely.
 */
const RuntimeWrapper = ({
  mode,
  conversationId,
  flowVersionId,
  title,
  description,
  badge,
  readOnly,
  readOnlyMessage,
  initialMessages = [],
  isVoicePlayground = false,
  allowNewSession = false,
  defaultActions = [],
  onRequestComplete,
  onConversationAllocated,
  onNewSession,
}: RuntimeWrapperProps) => {
  const activeSuggestionsRef = useRef<string[]>([]);
  const queryClient = useQueryClient();

  const {
    stt: sttConfig,
    tts: ttsConfig,
    voice: voiceConfig,
    isTextToSpeechConfigured,
    sfx: voiceSfx,
    pronunciations,
  } = useChatAgentVoiceConfig();
  const currentFlow = useCurrentFlowStore((state) => state.currentFlow);
  const refId = currentFlow?.id ?? "";
  const refName = currentFlow?.name ?? "";
  const agentName = currentFlow?.name ?? null;

  const assistantVoice = useAssistantVoice({
    ttsConfig,
    voiceConfig,
    isTextToSpeechConfigured,
    refId,
    refName,
    agentName,
    pronunciations,
    sfx: voiceSfx,
  });

  const introText = useMemo(() => {
    const firstMessage = initialMessages[0];
    return firstMessage?.role === "assistant" && typeof firstMessage.content === "string"
      ? firstMessage.content
      : "";
  }, [initialMessages]);

  const handleSuggestionsUpdate = useCallback((actions: string[]) => {
    activeSuggestionsRef.current = Array.isArray(actions) ? actions : [];
  }, []);

  // Use a ref to maintain the latest ID without causing react stale closures in the adapters
  const conversationIdRef = useRef<string | undefined>(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Concurrency lock: prevents multiple API calls if `append` and `run` trigger simultaneously
  const allocatingPromiseRef = useRef<Promise<string | undefined> | null>(null);

  /**
   * Lazily fetches or allocates a conversation ID.
   * @param allocateIfMissing If true, makes an API call to create an ID if one doesn't exist.
   */
  const getConversationId = useCallback(
    async (allocateIfMissing: boolean = false): Promise<string | undefined> => {
      // 1. Return immediately if we already have it
      if (conversationIdRef.current) return conversationIdRef.current;
      // 2. Bail if we shouldn't allocate
      if (!allocateIfMissing || mode === "temporary" || readOnly) return undefined;
      // 3. Return the ongoing allocation promise if one is already in flight (Concurrency Lock)
      if (allocatingPromiseRef.current) return allocatingPromiseRef.current;

      // 4. Initiate database creation
      allocatingPromiseRef.current = (async () => {
        try {
          const res = await insertConversation(flowVersionId);
          const newId = res.data?.id;
          if (newId) {
            conversationIdRef.current = newId;
            onConversationAllocated?.(newId);
            queryClient.invalidateQueries({
              queryKey: ["chat-agents", "active"],
            });

            return newId;
          }
        } catch (err) {
          console.error("Database lazy allocation sequence failed:", err);
        } finally {
          allocatingPromiseRef.current = null; // Release lock
        }
        return undefined;
      })();

      return allocatingPromiseRef.current;
    },
    [mode, readOnly, flowVersionId, onConversationAllocated, queryClient],
  );

  /**
   * Database Storage Adapter.
   * Nullified entirely for temporary mode.
   * Nullified if readOnly AND no conversationId (prevents overwriting initialMessages).
   */
  const historyAdapter = useMemo(() => {
    if (mode === "temporary") return undefined;

    //  If we are in read-only mode and have no ID, bypass the DB completely.
    // This allows `initialMessages` to render without the DB adapter wiping them out.
    if (readOnly && !conversationIdRef.current) return undefined;

    return createHistoryAdapter(getConversationId);
  }, [getConversationId, mode, readOnly]);
  /**
   * Dynamic Suggestion Engine.
   */
  const suggestionAdapter: SuggestionAdapter = useMemo(
    () => ({
      async generate() {
        const standardItems = activeSuggestionsRef.current || [];
        return standardItems.map((prompt) => ({ prompt }));
      },
    }),
    [],
  );

  /**
   * Execution API Runtime.
   */
  const runtime = useLocalRuntime(
    useMemo(
      () =>
        createAssistantUIModelAdapter({
          flowVersionId,
          getConversationId, // Pass the dynamic getter
          onRequestComplete,
          onSuggestionsUpdate: handleSuggestionsUpdate,
          onTextDelta: assistantVoice.onTextDelta,
          onRunStart: assistantVoice.onRunStart,
          onToolCallFrame: assistantVoice.onToolCallFrame,
          onRunFinished: assistantVoice.onRunFinished,
          isTempChat: mode === "temporary",
          // Chat streams are scoped to the current flow's space.
          getExtraHeaders: getStudioSpaceHeaders,
        }),
      [
        flowVersionId,
        getConversationId,
        onRequestComplete,
        handleSuggestionsUpdate,
        mode,
        assistantVoice.onTextDelta,
        assistantVoice.onRunStart,
        assistantVoice.onToolCallFrame,
        assistantVoice.onRunFinished,
      ],
    ),
    {
      initialMessages,
      adapters: {
        suggestion: suggestionAdapter,
        ...(historyAdapter ? { history: historyAdapter } : {}),
      },
    },
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <VoiceSessionLayer
        isVoicePlayground={isVoicePlayground}
        assistantVoice={assistantVoice}
        introText={introText}
        sttConfig={sttConfig}
        ttsConfig={ttsConfig}
        voiceConfig={voiceConfig}
        refId={refId}
        refName={refName}
        agentName={agentName}
        title={title}
        description={description}
        badge={badge}
        allowNewSession={allowNewSession}
        defaultActions={defaultActions}
        onNewSession={onNewSession}
      />
    </AssistantRuntimeProvider>
  );
};

type VoiceSessionLayerProps = {
  isVoicePlayground: boolean;
  assistantVoice: ReturnType<typeof useAssistantVoice>;
  introText: string;
  sttConfig: ModelConfigType | null;
  ttsConfig: ModelConfigType | null;
  voiceConfig: VoiceConfigType | null;
  refId: string;
  refName: string;
  agentName: string | null;
  title?: string;
  description?: string;
  badge?: string;
  allowNewSession?: boolean;
  defaultActions?: string[];
  onNewSession?: () => void;
};

type VoiceSession = ReturnType<typeof useVoiceSession>;

const VoiceSessionLayer = ({
  isVoicePlayground,
  assistantVoice,
  introText,
  sttConfig,
  ttsConfig,
  voiceConfig,
  refId,
  refName,
  agentName,
  title,
  description,
  badge,
  allowNewSession,
  defaultActions,
  onNewSession,
}: VoiceSessionLayerProps) => {
  const aui = useAui();
  const [realtimeInterimTranscript, setRealtimeInterimTranscript] = useState("");
  const session = useVoiceSession({
    isVoicePlayground,
    sttConfig,
    ttsConfig,
    voiceConfig,
    setSpeakReplies: assistantVoice.setSpeakReplies,
    abortLiveSynthesis: assistantVoice.abortLiveSynthesis,
    isSynthesizing: assistantVoice.isSynthesizing,
    onSessionEnded: onNewSession,
  });

  useVoiceIntroSpeech({
    text: introText,
    enabled: isVoicePlayground && session.isActive && assistantVoice.speakReplies,
    engine: session.engine,
    sessionKey: session.sessionId,
    ttsConfig,
    voiceConfig,
    refId,
    refName,
    agentName,
  });

  const bargeIn = useCallback(() => {
    useVoicePlaybackStore.getState().interrupt();
    assistantVoice.abortLiveSynthesis();
    aui.thread.cancelRun();
    session.reportSessionState("listening");
  }, [assistantVoice, aui, session]);

  const voiceContextValue = useMemo<AssistantVoiceContextValue>(
    () => ({
      isVoicePlayground,
      speakReplies: assistantVoice.speakReplies,
      isPlaying: assistantVoice.isPlaying,
      isSynthesizing: assistantVoice.isSynthesizing,
      ttsError: assistantVoice.ttsError,
      setSpeakReplies: assistantVoice.setSpeakReplies,
      retryLastReply: assistantVoice.retryLastReply,
      abortLiveSynthesis: assistantVoice.abortLiveSynthesis,
      sessionState: session.sessionState,
      sessionEngine: session.engine,
      configuredSessionEngine: session.configuredEngine,
      isVoiceSessionActive: session.isActive,
      startSession: session.startSession,
      endSession: session.endSession,
      sessionError: session.sessionError,
      realtimeInterimTranscript: realtimeInterimTranscript || null,
      pipelineSwitchOffered: session.pipelineSwitchOffered,
      switchToPipelineForSession: session.switchToPipelineForSession,
      retrySessionError: session.retrySessionError,
      clearSessionError: session.clearSessionError,
      sttConfig,
      ttsConfig,
      language: voiceConfig?.language ?? null,
      refId,
      refName,
      agentName,
    }),
    [
      isVoicePlayground,
      assistantVoice,
      session,
      realtimeInterimTranscript,
      sttConfig,
      ttsConfig,
      voiceConfig?.language,
      refId,
      refName,
      agentName,
    ],
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantVoiceContext.Provider value={voiceContextValue}>
        {session.isActive && session.micStream && session.config && (
          <>
            {session.engine === "pipeline" ? (
              <PipelineEngineMount
                stream={session.micStream}
                config={session.config}
                bridge={session.engineActionsRef}
                refId={refId}
                refName={refName}
                agentName={agentName}
                getState={session.getSessionState}
                onState={session.reportSessionState}
                onError={session.reportSessionError}
                bargeIn={bargeIn}
              />
            ) : (
              <RealtimeEngineMount
                stream={session.micStream}
                config={session.config}
                bridge={session.engineActionsRef}
                getState={session.getSessionState}
                onState={session.reportSessionState}
                onError={session.reportSessionError}
                onInterimTranscript={setRealtimeInterimTranscript}
                bargeIn={bargeIn}
              />
            )}
          </>
        )}
        <SuggestionsProvider defaultActions={defaultActions}>
          <Thread
            title={title}
            description={description}
            badge={badge}
            allowNewSession={allowNewSession}
            onNewSession={onNewSession}
            readOnlyMessage={readOnlyMessage}
          />
        </SuggestionsProvider>
      </AssistantVoiceContext.Provider>
    </AssistantRuntimeProvider>
  );
};

type VoiceEngineMountProps = {
  stream: MediaStream;
  config: Parameters<typeof useVoicePipelineEngine>[0]["config"];
  bridge: VoiceSession["engineActionsRef"];
  getState: VoiceSession["getSessionState"];
  onState: VoiceSession["reportSessionState"];
  onError: VoiceSession["reportSessionError"];
  bargeIn: () => void;
};

const PipelineEngineMount = ({
  stream,
  config,
  bridge,
  getState,
  onState,
  onError,
  bargeIn,
  refId,
  refName,
  agentName,
}: VoiceEngineMountProps & { refId: string; refName: string; agentName: string | null }) => {
  useVoicePipelineEngine({
    stream,
    config,
    bridge,
    refId,
    refName,
    agentName,
    getState,
    onState,
    onError,
    bargeIn,
  });
  return null;
};

const RealtimeEngineMount = ({
  stream,
  config,
  bridge,
  getState,
  onState,
  onError,
  onInterimTranscript,
  bargeIn,
}: VoiceEngineMountProps & { onInterimTranscript: (text: string) => void }) => {
  useVoiceRealtimeEngine({
    stream,
    config,
    bridge,
    getState,
    onState,
    onError,
    onInterimTranscript,
    bargeIn,
  });
  return null;
};

/**
 * Provides the `suggestions` scope to the thread. `useAui` must be called
 * INSIDE the AssistantRuntimeProvider (which installs the AuiProvider
 * internally); we then extend that client with the suggestions scope via a
 * nested AuiProvider.
 */
const SuggestionsProvider = ({
  defaultActions,
  children,
}: {
  defaultActions?: string[];
  children: React.ReactNode;
}) => {
  const aui = useAui();
  const config = AuiConfig({ suggestions: Suggestions(defaultActions ?? []) });
  return (
    <AuiProvider extends={aui} config={config}>
      {children}
    </AuiProvider>
  );
};
