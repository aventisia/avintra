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
import { useCallback, useMemo, useRef, useState } from "react";

import { useCurrentFlowStore } from "@/stores/current-flow-store";
import type { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";
import { getStudioSpaceHeaders } from "@/utils/space-headers";

import {
  VoiceAssistantContext,
  VoiceAssistantContextValue,
} from "../context/voice-assistant.context";
import { useVoiceAgentConfig } from "../hooks/useVoiceAgentConfig.hook";
import { useVoiceIntroSpeech } from "../hooks/useVoiceIntroSpeech.hook";
import { useVoicePipelineEngine } from "../hooks/useVoicePipelineEngine.hook";
import { useVoiceRealtimeEngine } from "../hooks/useVoiceRealtimeEngine.hook";
import { useVoiceSession } from "../hooks/useVoiceSession.hook";
import { useVoiceSpeech } from "../hooks/useVoiceSpeech.hook";
import { useVoicePlaybackStore } from "../stores/voice-playback.store";
import { VoiceThreadView } from "./voice-thread-view";

export type VoicePlatformAssistantUIProps = {
  /** Explicit flow version ID (Required). */
  flowVersionId: string;
  /** Voice Test sessions are always ephemeral. */
  mode?: "temporary";
  /** Visual thread title. */
  title?: string;
  /** Small pill rendered above the thread title. */
  badge?: string;
  /** Visual thread description. */
  description?: string;
  /** Seeded transcript, including the spoken introduction. */
  initialMessages?: readonly ThreadMessageLike[];
  /** Renders a header action that starts a fresh transcript. */
  allowNewSession?: boolean;
  /** Callback fired when a workflow execution completes. */
  onRequestComplete?: () => void;
  /** Fallback suggestions for an empty transcript. */
  defaultActions?: string[];
  /** Styling wrapper classes. */
  className?: string;
};

/**
 * Standalone voice-first test surface for a Voice Agent flow.
 * Owns its runtime, session controls, engines, and read-only transcript.
 */
export const VoicePlatformAssistantUI = ({
  flowVersionId,
  mode = "temporary",
  allowNewSession = false,
  defaultActions = [],
  className = "flex h-full flex-col w-full bg-background",
  ...props
}: VoicePlatformAssistantUIProps) => {
  const [sessionKey, setSessionKey] = useState(() => `voice-session-${window.crypto.randomUUID()}`);

  const handleNewSession = useCallback(() => {
    useVoicePlaybackStore.getState().stop();
    setSessionKey(`voice-session-${window.crypto.randomUUID()}`);
  }, []);

  return (
    <div className={className}>
      <VoiceRuntime
        key={`${mode}-${flowVersionId}-${sessionKey}`}
        flowVersionId={flowVersionId}
        allowNewSession={allowNewSession}
        defaultActions={defaultActions}
        onNewSession={handleNewSession}
        {...props}
      />
    </div>
  );
};

type VoiceRuntimeProps = Omit<VoicePlatformAssistantUIProps, "className" | "mode"> & {
  onNewSession: () => void;
};

const VoiceRuntime = ({
  flowVersionId,
  title,
  description,
  badge,
  initialMessages = [],
  allowNewSession = false,
  defaultActions = [],
  onRequestComplete,
  onNewSession,
}: VoiceRuntimeProps) => {
  const activeSuggestionsRef = useRef<string[]>([]);

  const {
    stt: sttConfig,
    tts: ttsConfig,
    voice: voiceConfig,
    isTextToSpeechConfigured,
    sfx,
    pronunciations,
  } = useVoiceAgentConfig();
  const currentFlow = useCurrentFlowStore((state) => state.currentFlow);
  const refId = currentFlow?.id ?? "";
  const refName = currentFlow?.name ?? "";
  const agentName = currentFlow?.name ?? null;

  const speech = useVoiceSpeech({
    ttsConfig,
    voiceConfig,
    isTextToSpeechConfigured,
    refId,
    refName,
    agentName,
    pronunciations,
    sfx,
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

  const suggestionAdapter: SuggestionAdapter = useMemo(
    () => ({
      async generate() {
        const standardItems = activeSuggestionsRef.current || [];
        return standardItems.map((prompt) => ({ prompt }));
      },
    }),
    [],
  );

  const runtime = useLocalRuntime(
    useMemo(
      () =>
        createAssistantUIModelAdapter({
          flowVersionId,
          getConversationId: async () => undefined,
          onRequestComplete,
          onSuggestionsUpdate: handleSuggestionsUpdate,
          onTextDelta: speech.onTextDelta,
          onRunStart: speech.onRunStart,
          onToolCallFrame: speech.onToolCallFrame,
          onRunFinished: speech.onRunFinished,
          isTempChat: true,
          getExtraHeaders: getStudioSpaceHeaders,
        }),
      [
        flowVersionId,
        onRequestComplete,
        handleSuggestionsUpdate,
        speech.onTextDelta,
        speech.onRunStart,
        speech.onToolCallFrame,
        speech.onRunFinished,
      ],
    ),
    {
      initialMessages,
      adapters: {
        suggestion: suggestionAdapter,
      },
    },
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SuggestionsProvider defaultActions={defaultActions}>
        <VoiceSessionLayer
          speech={speech}
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
          onNewSession={onNewSession}
        />
      </SuggestionsProvider>
    </AssistantRuntimeProvider>
  );
};

type VoiceSpeech = ReturnType<typeof useVoiceSpeech>;
type VoiceSession = ReturnType<typeof useVoiceSession>;

type VoiceSessionLayerProps = {
  speech: VoiceSpeech;
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
  allowNewSession: boolean;
  onNewSession: () => void;
};

const VoiceSessionLayer = ({
  speech,
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
  onNewSession,
}: VoiceSessionLayerProps) => {
  const aui = useAui();
  const [realtimeInterimTranscript, setRealtimeInterimTranscript] = useState("");
  const session = useVoiceSession({
    sttConfig,
    ttsConfig,
    voiceConfig,
    setSpeakReplies: speech.setSpeakReplies,
    abortLiveSynthesis: speech.abortLiveSynthesis,
    isSynthesizing: speech.isSynthesizing,
    onSessionEnded: onNewSession,
  });

  useVoiceIntroSpeech({
    text: introText,
    enabled: session.isActive && speech.speakReplies,
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
    speech.abortLiveSynthesis();
    aui.thread.cancelRun();
    session.reportSessionState("listening");
  }, [speech, aui, session]);

  const voiceContextValue = useMemo<VoiceAssistantContextValue>(
    () => ({
      speakReplies: speech.speakReplies,
      isPlaying: speech.isPlaying,
      isSynthesizing: speech.isSynthesizing,
      ttsError: speech.ttsError,
      setSpeakReplies: speech.setSpeakReplies,
      retryLastReply: speech.retryLastReply,
      abortLiveSynthesis: speech.abortLiveSynthesis,
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
      speech,
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
    <VoiceAssistantContext.Provider value={voiceContextValue}>
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
      <VoiceThreadView
        title={title}
        description={description}
        badge={badge}
        allowNewSession={allowNewSession}
        onNewSession={onNewSession}
      />
    </VoiceAssistantContext.Provider>
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
