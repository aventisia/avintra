import { useMemo } from "react";

import { CHAT_AGENT_NODE_NAME } from "@/features/react-flow/utils/chat-agent-graph.util";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";
import { NodeDataType, NodeInputType } from "@/types/node-data-type";

/** Chat AI input keys that hold the voice-related configuration. */
const STT_INPUT_KEY = "__ModelConfig__SpeechToText";
const TTS_INPUT_KEY = "__ModelConfig__TextToSpeech";
const VOICE_INPUT_KEY = "__VoiceConfig__TextToSpeech";

export type ChatAgentVoiceConfig = {
  /** Speech-to-Text model config, or null when not configured. */
  stt: ModelConfigType | null;
  /** Text-to-Speech model config, or null when not configured. */
  tts: ModelConfigType | null;
  /** Voice settings (language/voice/speed), or null when not configured. */
  voice: VoiceConfigType | null;
  /** True when both speech models are configured and voice controls can run. */
  isConfigured: boolean;
};

/**
 * Reads the Chat AI node's voice configuration from the current flow graph.
 * Missing keys yield nulls so the UI can disable the voice controls gracefully.
 */
export const useChatAgentVoiceConfig = (): ChatAgentVoiceConfig => {
  const nodes = useReactFlowExtStore((state) => state.nodes);

  return useMemo(() => {
    const chatNode = nodes.find(
      (node) =>
        node.type === "aiNode" &&
        (node.data as NodeDataType | undefined)?.name === CHAT_AGENT_NODE_NAME,
    );
    const inputs: NodeInputType[] = (chatNode?.data as NodeDataType | undefined)?.inputs ?? [];
    const findValue = (key: string): unknown => inputs.find((input) => input.key === key)?.value;

    const stt = (findValue(STT_INPUT_KEY) as ModelConfigType | undefined) ?? null;
    const tts = (findValue(TTS_INPUT_KEY) as ModelConfigType | undefined) ?? null;
    const voice = (findValue(VOICE_INPUT_KEY) as VoiceConfigType | undefined) ?? null;

    return {
      stt,
      tts,
      voice,
      isConfigured: Boolean(stt?.model) && Boolean(tts?.model),
    };
  }, [nodes]);
};
