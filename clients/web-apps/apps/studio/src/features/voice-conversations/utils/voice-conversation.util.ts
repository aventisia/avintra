import type { VoiceCaptionTurn, VoiceToolCall, VoiceTurnLatency } from "@avplatform/assistant-chat";

import type { ConversationDto, ConversationMessageDto } from "../dtos/conversation.dto";
import { ConversationMessageSenderEnum } from "../enums/conversation-message-sender.enum";
import { ConversationStatusEnum } from "../enums/conversation-status.enum";
import type {
  VoiceConversationOutcome,
  VoiceConversationSummary,
} from "../types/voice-conversation.type";

const TRANSCRIPT_KEY = "ui_transcript";
const TIMING_KEY = "voice_turn_timing";

const toNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const toLatency = (
  metadata: Record<string, unknown> | null | undefined,
): VoiceTurnLatency | undefined => {
  const timing = metadata?.[TIMING_KEY];
  if (!timing || typeof timing !== "object") return undefined;

  const value = timing as Record<string, unknown>;
  const latency: VoiceTurnLatency = {
    speechToTextMs: toNumber(value.stt_ms),
    endpointingMs: toNumber(value.endpointing_ms),
    firstTokenMs: toNumber(value.llm_first_token_ms),
    firstAudioMs: toNumber(value.tts_first_audio_ms),
    callerToSpeakingMs: toNumber(value.caller_to_speaking_ms),
    ttftMs: toNumber(value.ttft_ms),
    durationMs: toNumber(value.duration_ms),
  };
  return Object.values(latency).some((ms) => ms !== null) ? latency : undefined;
};

const toOutcome = (status: ConversationStatusEnum): VoiceConversationOutcome => {
  if (status === ConversationStatusEnum.Failed) return "error";
  if (status === ConversationStatusEnum.Active) return "active";
  return "completed";
};

const toToolCall = (message: ConversationMessageDto): VoiceToolCall => {
  const name = message.metadata?.name;
  const durationMs = toNumber(message.metadata?.duration_ms);
  return {
    name: typeof name === "string" && name ? name : "Tool",
    ...(durationMs !== null ? { durationMs } : {}),
  };
};

const toDurationMs = (startedAt: string, endedAt: string): number => {
  const started = new Date(startedAt).getTime();
  const ended = new Date(endedAt).getTime();
  return Number.isFinite(started) && Number.isFinite(ended) ? Math.max(0, ended - started) : 0;
};

export const toVoiceConversationSummary = (dto: ConversationDto): VoiceConversationSummary => ({
  id: dto.id,
  title: dto.title,
  startedAt: dto.createdOn,
  durationMs: toDurationMs(dto.createdOn, dto.lastModifiedOn),
  outcome: toOutcome(dto.status),
});

const attachLatency = (
  turns: VoiceCaptionTurn[],
  latency: VoiceTurnLatency,
): VoiceCaptionTurn[] => {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    if (turns[index].speaker !== "agent") continue;
    return turns.map((turn, position) => (position === index ? { ...turn, latency } : turn));
  }
  return turns;
};

export const toVoiceConversationTurns = (
  messages: ConversationMessageDto[],
): VoiceCaptionTurn[] => {
  let turns: VoiceCaptionTurn[] = [];
  let pendingToolCalls: VoiceToolCall[] = [];

  for (const message of messages) {
    const latency = toLatency(message.metadata);

    // IMPORTANT NOTE: pipeline turns store a UI-only transcript row with the same
    // text; only its timing is used, never its content.
    if (message.metadata?.[TRANSCRIPT_KEY] === true) {
      if (latency) turns = attachLatency(turns, latency);
      continue;
    }

    if (message.role === ConversationMessageSenderEnum.Tool) {
      pendingToolCalls.push(toToolCall(message));
      continue;
    }

    const text = message.content.trim();
    if (!text) continue;
    if (message.role === ConversationMessageSenderEnum.User) {
      turns.push({ id: message.id, speaker: "caller", text });
    } else if (message.role === ConversationMessageSenderEnum.Assistant) {
      const toolCalls = pendingToolCalls;
      pendingToolCalls = [];
      turns.push({
        id: message.id,
        speaker: "agent",
        text,
        latency,
        ...(toolCalls.length ? { toolCalls } : {}),
      });
    }
  }

  if (pendingToolCalls.length) {
    turns.push({
      id: "tool-calls",
      speaker: "agent",
      text: "",
      toolCalls: pendingToolCalls,
    });
  }

  return turns;
};
