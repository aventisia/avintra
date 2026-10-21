import { useMemo } from "react";

import {
  PronunciationConfigEntry,
  SfxConfig,
  getPronunciationConfig,
  getSfxConfig,
} from "@/features/dynamic-config-panel/utils/ai-node-config-helper";
import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";
import { NodeDataType, NodeInputType } from "@/types/node-data-type";

const STT_INPUT_KEY = "__ModelConfig__SpeechToText";
const TTS_INPUT_KEY = "__ModelConfig__TextToSpeech";
const VOICE_INPUT_KEY = "__VoiceConfig__TextToSpeech";

export type VoiceAgentConfig = {
  /** Speech-to-Text model config, or null when not configured. */
  stt: ModelConfigType | null;
  /** Text-to-Speech model config, or null when not configured. */
  tts: ModelConfigType | null;
  /** Voice settings (language/voice/speed), or null when not configured. */
  voice: VoiceConfigType | null;
  /** True when a Text-to-Speech model is configured, so replies can be spoken. */
  isTextToSpeechConfigured: boolean;
  /** VoiceAgent sound-effect settings; disabled when not configured. */
  sfx: SfxConfig;
  /** VoiceAgent pronunciation aliases; empty when not configured. */
  pronunciations: PronunciationConfigEntry[];
};

/** Reads the Voice agent's voice configuration from the current flow graph. */
export const useVoiceAgentConfig = (): VoiceAgentConfig => {
  const nodes = useReactFlowExtStore((state) => state.nodes);

  return useMemo(() => {
    const agentNode = nodes.find((node) => {
      const name = (node.data as NodeDataType | undefined)?.name;

      return node.type === "aiNode" && name === VOICE_AGENT_NODE_NAME;
    });
    const nodeData = agentNode?.data as NodeDataType | undefined;
    const inputs: NodeInputType[] = nodeData?.inputs ?? [];
    const findValue = (key: string): unknown => inputs.find((input) => input.key === key)?.value;

    const stt = (findValue(STT_INPUT_KEY) as ModelConfigType | undefined) ?? null;
    const tts = (findValue(TTS_INPUT_KEY) as ModelConfigType | undefined) ?? null;
    const voice = (findValue(VOICE_INPUT_KEY) as VoiceConfigType | undefined) ?? null;
    const values = Object.fromEntries(inputs.map((input) => [input.key, input.value]));

    return {
      stt,
      tts,
      voice,
      isTextToSpeechConfigured: Boolean(tts?.model),
      sfx: getSfxConfig(values),
      pronunciations: getPronunciationConfig(values)?.config ?? [],
    };
  }, [nodes]);
};
