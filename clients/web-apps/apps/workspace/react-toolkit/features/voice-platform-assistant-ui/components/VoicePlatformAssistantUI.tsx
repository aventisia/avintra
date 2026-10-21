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

import type { AssistChatDto } from "@/features/04-assist/my-chats/dtos/assist-chat-dto";
import { getSpaceHeaders } from "@/utils/space-headers";

import {
  type VoiceAssistantContextValue,
  VoiceAssistantContext,
} from "../context/voice-assistant.context";
import {
  type WorkspaceVoiceAgentConfig,
  useWorkspaceVoiceConfig,
} from "../hooks/useWorkspaceVoiceConfig.hook";
import { useVoiceIntroSpeech } from "../hooks/useVoiceIntroSpeech.hook";
import { useVoicePipelineEngine } from "../hooks/useVoicePipelineEngine.hook";
import { useVoiceRealtimeEngine } from "../hooks/useVoiceRealtimeEngine.hook";
import { useVoiceSession } from "../hooks/useVoiceSession.hook";
import { useVoiceSpeech } from "../hooks/useVoiceSpeech.hook";
import { useVoicePlaybackStore } from "../stores/voice-playback.store";
import type { VoiceEngine } from "../utils/voice-session.util";
import { VoiceThreadView } from "./VoiceThreadView";

export type VoicePlatformAssistantUIProps = {
  /** Explicit flow version ID of the published agent. */
  flowVersionId: string;
  /** Published agent metadata the config adapter reads. */
  agent?: AssistChatDto;
  /** Voice sessions are always ephemeral. */
  mode?: "temporary";
  /** Visual thread title. */
  title?: string;
  /** Small pill rendered above the thread title. */
  badge?: string;
  /** Visual thread description. */
  description?: string;
  /** Seeded transcript, including the spoken introduction. */
  initialMessages?: readonly ThreadMessageLike[];
  /** Fallback suggestions for an empty transcript. */
  defaultActions?: string[];
  /** Verification seam: supplies a voice config the published agent does not expose yet. */
  voiceConfigOverride?: Partial<WorkspaceVoiceAgentConfig> | null;
  /** Callback fired when a workflow execution completes. */
  onRequestComplete?: () => void;
  /** Styling wrapper classes. */
  className?: string;
};

/**
 * Standalone voice-first surface for a published voice agent.
 * Owns its runtime, session controls, engines, and read-only transcript.
 */
export const VoicePlatformAssistantUI = ({
  flowVersionId,
  mode = "temporary",
  defaultActions = [],
  className = "flex h-full flex-col w-full bg-background",
  ...props
}: VoicePlatformAssistantUIProps) => {
  const [sessionKey] = useState(() => `voice-session-${window.crypto.randomUUID()}`);

  return (
    <div className={className}>
      <VoiceRuntime
        key={`${mode}-${flowVersionId}-${sessionKey}`}
        flowVersionId={flowVersionId}
        defaultActions={defaultActions}
        {...props}
      />
    </div>
  );
};

type VoiceRuntimeProps = Omit<VoicePlatformAssistantUIProps, "className" | "mode">;

const VoiceRuntime = ({
  flowVersionId,
  agent,
  title,
  description,
  badge,
  initialMessages = [],
  defaultActions = [],
  voiceConfigOverride = null,
  onRequestComplete,
}: VoiceRuntimeProps) => {
  const activeSuggestionsRef = useRef<string[]>([]);
  const config = useWorkspaceVoiceConfig(agent, voiceConfigOverride);

  const refId = flowVersionId;
  const refName = agent?.name ?? "";
  const agentName = agent?.name ?? null;

  const speech = useVoiceSpeech({
    ttsConfig: config.tts,
    voiceConfig: config.voice,
    isTextToSpeechConfigured: config.isTextToSpeechConfigured,
    refId,
    refName,
    agentName,
    pronunciations: config.pronunciations,
    sfx: config.sfx,
  });

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
          getExtraHeaders: getSpaceHeaders,
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
          config={config}
          refId={refId}
          refName={refName}
          agentName={agentName}
          title={title}
          description={description}
          badge={badge}
        />
      </SuggestionsProvider>
    </AssistantRuntimeProvider>
  );
};

type VoiceSpeech = ReturnType<typeof useVoiceSpeech>;
type VoiceSession = ReturnType<typeof useVoiceSession>;

type VoiceSessionLayerProps = {
  speech: VoiceSpeech;
  config: WorkspaceVoiceAgentConfig;
  refId: string;
  refName: string;
  agentName: string | null;
  title?: string;
  description?: string;
  badge?: string;
};

const VoiceSessionLayer = ({
  speech,
  config,
  refId,
  refName,
  agentName,
  title,
  description,
  badge,
}: VoiceSessionLayerProps) => {
  const aui = useAui();
  const [realtimeUserInterimTranscript, setRealtimeUserInterimTranscript] = useState("");
  const [realtimeAssistantInterimTranscript, setRealtimeAssistantInterimTranscript] = useState("");
  const handleInterimTranscripts = useCallback((next: { user: string; assistant: string }) => {
    setRealtimeUserInterimTranscript(next.user);
    setRealtimeAssistantInterimTranscript(next.assistant);
  }, []);
  const configuredEngine = useMemo<VoiceEngine>(
    () => (config.realtimeReady ? "realtime" : "pipeline"),
    [config.realtimeReady],
  );
  const session = useVoiceSession({
    configuredEngine,
    sttConfig: config.stt,
    ttsConfig: config.tts,
    voiceConfig: config.voice,
    realtime: config.realtime,
    setSpeakReplies: speech.setSpeakReplies,
    abortLiveSynthesis: speech.abortLiveSynthesis,
    isSynthesizing: speech.isSynthesizing,
  });

  useVoiceIntroSpeech({
    text: config.introText,
    enabled: session.isActive && speech.speakReplies,
    engine: session.engine,
    sessionKey: session.sessionId,
    ttsConfig: config.tts,
    voiceConfig: config.voice,
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
      realtimeUserInterimTranscript: realtimeUserInterimTranscript || null,
      realtimeAssistantInterimTranscript: realtimeAssistantInterimTranscript || null,
      pipelineSwitchOffered: session.pipelineSwitchOffered,
      switchToPipelineForSession: session.switchToPipelineForSession,
      retrySessionError: session.retrySessionError,
      clearSessionError: session.clearSessionError,
      sttConfig: config.stt,
      ttsConfig: config.tts,
      language: config.voice?.language ?? null,
      refId,
      refName,
      agentName,
    }),
    [
      speech,
      session,
      realtimeUserInterimTranscript,
      realtimeAssistantInterimTranscript,
      config.stt,
      config.tts,
      config.voice?.language,
      refId,
      refName,
      agentName,
    ],
  );

  const engineMode = session.isActive ? session.engine : session.configuredEngine;

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
              onInterimTranscripts={handleInterimTranscripts}
              bargeIn={bargeIn}
            />
          )}
        </>
      )}
      <VoiceThreadView
        title={title}
        description={description}
        badge={badge}
        notConfiguredReasons={config.notConfiguredReasons}
        engineMode={engineMode}
        pipelineReady={config.pipelineReady}
        realtimeReady={config.realtimeReady}
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
  onInterimTranscripts,
  bargeIn,
}: VoiceEngineMountProps & {
  onInterimTranscripts: (next: { user: string; assistant: string }) => void;
}) => {
  useVoiceRealtimeEngine({
    stream,
    config,
    bridge,
    getState,
    onState,
    onError,
    onInterimTranscripts,
    bargeIn,
  });
  return null;
};

/**
 * Provides the `suggestions` scope to the thread. `useAui` must be called
 * inside the AssistantRuntimeProvider; a nested AuiProvider extends that client.
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
