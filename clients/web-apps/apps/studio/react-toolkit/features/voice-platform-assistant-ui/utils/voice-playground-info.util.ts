import type { Node } from "@xyflow/react";

import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";
import { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";
import { NodeDataType, NodeInputType } from "@/types/node-data-type";

const WEBHOOK_URL_INPUT_KEY = "__TranscriptWebhookUrl__Voice";
const ENGINE_MODE_INPUT_KEY = "__EngineMode__Voice";
const ESCALATION_DESTINATION_INPUT_KEY = "__EscalationDestination__Voice";
const REALTIME_MODEL_INPUT_KEY = "__ModelConfig__RealtimeVoice";
const VOICE_CONFIG_INPUT_KEY = "__VoiceConfig__TextToSpeech";

export const SUPPRESSED_WEBHOOK_NOTICE =
  "Transcript webhook suppressed in the Test \u2014 logged here as a simulated event instead of delivery.";

export type PlaygroundNotices = {
  /** True when the agent configures a transcript webhook URL. */
  webhookConfigured: boolean;
  /** Configured voice engine mode; 'pipeline' when absent. */
  engineMode: string;
  /** Configured escalation destination; empty when unset. */
  escalationDestination: string;
  /** Deferred features that are configured on the agent, by display name. */
  deferred: string[];
};

type DeferredFeature = {
  label: string;
  inputKey: string;
  isConfigured: (value: unknown) => boolean;
};

const isEnabledFlag = (value: unknown): boolean => value === true;

const isConfiguredString = (value: unknown): boolean =>
  typeof value === "string" && value.trim().length > 0 && value.trim().toLowerCase() !== "none";

const DEFERRED_FEATURES: DeferredFeature[] = [
  { label: "avatar", inputKey: "__VirtualAvatar__Voice", isConfigured: isEnabledFlag },
  { label: "screen share", inputKey: "__ScreenShare__Voice", isConfigured: isEnabledFlag },
  { label: "camera feed", inputKey: "__CameraFeed__Voice", isConfigured: isEnabledFlag },
  { label: "call recording", inputKey: "__CallRecording__Voice", isConfigured: isEnabledFlag },
  {
    label: "noise cancellation",
    inputKey: "__NoiseCancellation__Voice",
    isConfigured: isConfiguredString,
  },
  {
    label: "preemptive generation",
    inputKey: "__PreemptiveGeneration__Voice",
    isConfigured: isEnabledFlag,
  },
];

/** Reads the Voice AI node inputs from the canvas graph; empty when the node is absent. */
export const getVoiceAgentPlaygroundInputs = (nodes: Node[]): NodeInputType[] => {
  const agentNode = nodes.find(
    (node) => (node.data as NodeDataType | undefined)?.name === VOICE_AGENT_NODE_NAME,
  );

  return (agentNode?.data as NodeDataType | undefined)?.inputs ?? [];
};

export type RealtimeVoiceSettings = {
  /** Configured realtime provider, or an empty string. */
  provider: string;
  /** Configured realtime model, or an empty string. */
  model: string;
  /** Credential name forwarded to the gateway; never a secret value. */
  credentialName: string;
  /** Configured realtime voice, or an empty string. */
  voice: string;
  /** Configured language hint, or an empty string. */
  language: string;
};

/** Reads the realtime provider/model/credential and voice settings from the agent inputs. */
export const getRealtimeVoiceSettings = (inputs: NodeInputType[]): RealtimeVoiceSettings => {
  const findValue = (key: string): unknown => inputs.find((input) => input.key === key)?.value;
  const modelConfig = findValue(REALTIME_MODEL_INPUT_KEY) as ModelConfigType | undefined;
  const voiceConfig = findValue(VOICE_CONFIG_INPUT_KEY) as VoiceConfigType | undefined;

  return {
    provider: modelConfig?.provider?.trim() ?? "",
    model: modelConfig?.model?.trim() ?? "",
    credentialName: modelConfig?.credential_name?.trim() ?? "",
    voice: voiceConfig?.voice?.trim() ?? "",
    language: voiceConfig?.language?.trim() ?? "",
  };
};

/** Reads the Test notices an agent configuration implies. */
export const getPlaygroundNotices = (inputs: NodeInputType[]): PlaygroundNotices => {
  const findValue = (key: string): unknown => inputs.find((input) => input.key === key)?.value;
  const engineModeValue = findValue(ENGINE_MODE_INPUT_KEY);
  const escalationValue = findValue(ESCALATION_DESTINATION_INPUT_KEY);
  const isNonBlankString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

  return {
    webhookConfigured: isNonBlankString(findValue(WEBHOOK_URL_INPUT_KEY)),
    engineMode: isNonBlankString(engineModeValue) ? engineModeValue.trim() : "pipeline",
    escalationDestination: isNonBlankString(escalationValue) ? escalationValue.trim() : "",
    deferred: DEFERRED_FEATURES.filter((feature) =>
      feature.isConfigured(findValue(feature.inputKey)),
    ).map((feature) => feature.label),
  };
};
