import type {
  VoiceCallSnapshot,
  VoiceCallState,
  VoiceCaptionTurn,
  VoiceServerEvent,
  VoiceToolCall,
  VoiceTurnLatency,
  VoiceTurnTiming,
} from "../types/voice-session.type";

export const VOICE_EVENT_TOPIC = "avintra.voice";

const CALLER_TURN_PREFIX = "caller";
const AGENT_TURN_PREFIX = "turn";
const FALLBACK_TOOL_NAME = "Tool";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const toNumber = (value: unknown): number | undefined => (isNumber(value) ? value : undefined);

const toString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const toNullableNumber = (value: unknown): number | null => (isNumber(value) ? value : null);

const toVoiceTurnTiming = (value: unknown): VoiceTurnTiming | undefined => {
  if (!isRecord(value)) return undefined;
  return {
    sttMs: toNullableNumber(value.stt_ms),
    llmFirstTokenMs: toNullableNumber(value.llm_first_token_ms),
    ttsFirstAudioMs: toNullableNumber(value.tts_first_audio_ms),
    turnTotalMs: toNullableNumber(value.turn_total_ms),
  };
};

/**
 * Decodes one `avintra.voice` data packet. Malformed payloads, unknown event
 * types, and other topics return `null` so callers can ignore them.
 */
export const parseVoiceEvent = (data: Uint8Array, topic?: string): VoiceServerEvent | null => {
  if (topic !== undefined && topic !== VOICE_EVENT_TOPIC) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(data));
  } catch {
    return null;
  }

  if (!isRecord(payload)) return null;

  const type = toString(payload.type);
  const conversationId = toString(payload.conversationId);
  if (!type || !conversationId) return null;

  switch (type) {
    case "session.state": {
      const state = toString(payload.state);
      if (!state) return null;
      return { type, conversationId, state, previousState: toString(payload.previousState) };
    }
    case "transcript.final": {
      const role = payload.role;
      const text = toString(payload.text);
      if ((role !== "user" && role !== "assistant") || text === undefined) return null;
      return { type, conversationId, role, text, turnId: toNumber(payload.turnId) };
    }
    case "tool.call":
      return { type, conversationId, tool: payload.tool, turnId: toNumber(payload.turnId) };
    case "timing": {
      const stage = payload.stage;
      if (stage !== "session" && stage !== "turn") return null;
      return {
        type,
        conversationId,
        stage,
        durationMs: toNumber(payload.durationMs),
        turnId: toNumber(payload.turnId),
        interrupted: payload.interrupted === true,
        voiceTurnTiming: toVoiceTurnTiming(payload.voice_turn_timing),
      };
    }
    case "error":
      return {
        type,
        conversationId,
        code: toString(payload.code) ?? "error",
        message: toString(payload.message) ?? "The voice session reported an error.",
        retryable: payload.retryable === true,
        turnId: toNumber(payload.turnId),
      };
    case "session.closed":
      return {
        type,
        conversationId,
        code: toNumber(payload.code),
        reason: toString(payload.reason),
      };
    default:
      return null;
  }
};

const mapSessionState = (state: string): VoiceCallState | null => {
  switch (state) {
    case "connecting":
      return "connecting";
    case "idle":
    case "listening":
      return "listening";
    case "processing":
      return "thinking";
    case "speaking":
      return "speaking";
    default:
      return null;
  }
};

const agentTurnId = (turnId: number) => `${AGENT_TURN_PREFIX}-${turnId}`;

const lastAgentTurnIndex = (turns: VoiceCaptionTurn[]): number => {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    if (turns[index].speaker === "agent") return index;
  }
  return -1;
};

const replaceTurn = (
  turns: VoiceCaptionTurn[],
  index: number,
  turn: VoiceCaptionTurn,
): VoiceCaptionTurn[] => turns.map((current, position) => (position === index ? turn : current));

const toMaybeName = (value: unknown): string | undefined => {
  const name = toString(value)?.trim();
  return name ? name : undefined;
};

const getToolName = (tool: unknown): string => {
  if (typeof tool === "string") return tool.trim() || FALLBACK_TOOL_NAME;
  if (isRecord(tool)) {
    for (const key of ["name", "tool", "tool_name"]) {
      const value = toMaybeName(tool[key]);
      if (value) return value;
    }
  }
  return FALLBACK_TOOL_NAME;
};

const toLatency = (timing?: VoiceTurnTiming): VoiceTurnLatency | null => {
  if (!timing) return null;
  const { sttMs, llmFirstTokenMs, ttsFirstAudioMs } = timing;
  if (!isNumber(sttMs) || !isNumber(llmFirstTokenMs) || !isNumber(ttsFirstAudioMs)) return null;
  return { speechToTextMs: sttMs, firstTokenMs: llmFirstTokenMs, firstAudioMs: ttsFirstAudioMs };
};

const appendToolCall = (
  snapshot: VoiceCallSnapshot,
  name: string,
  turnId: number | undefined,
): VoiceCallSnapshot => {
  const id = turnId !== undefined ? agentTurnId(turnId) : null;
  const index =
    id === null
      ? lastAgentTurnIndex(snapshot.turns)
      : snapshot.turns.findIndex((turn) => turn.id === id);

  if (index === -1) {
    const placeholder: VoiceCaptionTurn = {
      id: id ?? agentTurnId(snapshot.turns.length + 1),
      speaker: "agent",
      text: "",
      toolCalls: [{ name, isRunning: true }],
    };
    return { ...snapshot, turns: [...snapshot.turns, placeholder] };
  }

  const turn = snapshot.turns[index];
  const toolCall: VoiceToolCall = turn.text ? { name } : { name, isRunning: true };
  return {
    ...snapshot,
    turns: replaceTurn(snapshot.turns, index, {
      ...turn,
      toolCalls: [...(turn.toolCalls ?? []), toolCall],
    }),
  };
};

const appendTranscript = (snapshot: VoiceCallSnapshot, event: VoiceServerEvent) => {
  if (event.type !== "transcript.final") return snapshot;

  const text = event.text.trim();
  if (!text) return snapshot;

  if (event.role === "user") {
    const callerTurn: VoiceCaptionTurn = {
      id: `${CALLER_TURN_PREFIX}-${snapshot.turns.length + 1}`,
      speaker: "caller",
      text,
    };
    return { ...snapshot, turns: [...snapshot.turns, callerTurn] };
  }

  const id =
    event.turnId !== undefined ? agentTurnId(event.turnId) : agentTurnId(snapshot.turns.length + 1);
  const index = snapshot.turns.findIndex((turn) => turn.id === id);

  if (index === -1) {
    const agentTurn: VoiceCaptionTurn = { id, speaker: "agent", text };
    return { ...snapshot, turns: [...snapshot.turns, agentTurn] };
  }

  const turn = snapshot.turns[index];
  return {
    ...snapshot,
    turns: replaceTurn(snapshot.turns, index, {
      ...turn,
      text,
      toolCalls: turn.toolCalls?.map((toolCall) => ({ ...toolCall, isRunning: false })),
    }),
  };
};

const appendLatency = (snapshot: VoiceCallSnapshot, event: VoiceServerEvent): VoiceCallSnapshot => {
  if (event.type !== "timing" || event.stage !== "turn" || event.interrupted) return snapshot;

  const latency = toLatency(event.voiceTurnTiming);
  if (!latency) return snapshot;

  const id = event.turnId !== undefined ? agentTurnId(event.turnId) : null;
  const index =
    id === null
      ? lastAgentTurnIndex(snapshot.turns)
      : snapshot.turns.findIndex((turn) => turn.id === id);

  if (index === -1) {
    const agentTurn: VoiceCaptionTurn = {
      id: id ?? agentTurnId(snapshot.turns.length + 1),
      speaker: "agent",
      text: "",
      latency,
    };
    return { ...snapshot, turns: [...snapshot.turns, agentTurn] };
  }

  return {
    ...snapshot,
    turns: replaceTurn(snapshot.turns, index, { ...snapshot.turns[index], latency }),
  };
};

const applyClosedEvent = (
  snapshot: VoiceCallSnapshot,
  event: VoiceServerEvent,
): VoiceCallSnapshot => {
  if (event.type !== "session.closed") return snapshot;

  if (event.code === 1000) {
    return { ...snapshot, state: "ended", isActive: false, needsAudioResume: false };
  }

  const code = event.code !== undefined ? String(event.code) : "unknown";
  return {
    ...snapshot,
    state: "error",
    isActive: false,
    needsAudioResume: false,
    error: {
      code,
      message: `The voice session ended unexpectedly (code ${code}).`,
      retryable: false,
    },
  };
};

/** Pure reducer from a decoded worker event to the next call snapshot. */
export const applyVoiceEvent = (
  snapshot: VoiceCallSnapshot,
  event: VoiceServerEvent,
): VoiceCallSnapshot => {
  if (event.type === "session.closed") return applyClosedEvent(snapshot, event);
  if (!snapshot.isActive) return snapshot;

  const active = snapshot.error ? { ...snapshot, error: null } : snapshot;

  switch (event.type) {
    case "session.state": {
      const state = mapSessionState(event.state);
      return state && state !== active.state ? { ...active, state } : active;
    }
    case "transcript.final":
      return appendTranscript(active, event);
    case "tool.call":
      return appendToolCall(active, getToolName(event.tool), event.turnId);
    case "timing":
      return appendLatency(active, event);
    case "error":
      return {
        ...snapshot,
        error: { code: event.code, message: event.message, retryable: event.retryable === true },
      };
    default:
      return snapshot;
  }
};
