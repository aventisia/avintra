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
const FALLBACK_SKILL_NAME = "Skill";

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
    endpointingMs: toNullableNumber(value.endpointing_ms),
    callerToSpeakingMs: toNullableNumber(value.caller_to_speaking_ms),
    ttftMs: toNullableNumber(value.ttft_ms),
    durationMs: toNullableNumber(value.duration_ms),
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
    case "transcript.interim": {
      const text = toString(payload.text);
      if (payload.role !== "user" || text === undefined) return null;
      return { type, conversationId, role: "user", text };
    }
    case "tool.call":
      return { type, conversationId, tool: payload.tool, turnId: toNumber(payload.turnId) };
    case "skill.call":
      return {
        type,
        conversationId,
        skill: getName(payload.skill, FALLBACK_SKILL_NAME),
        turnId: toNumber(payload.turnId),
      };
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

const getName = (value: unknown, fallback: string): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (isRecord(value)) {
    for (const key of ["name", "tool", "tool_name"]) {
      const name = toMaybeName(value[key]);
      if (name) return name;
    }
  }
  return fallback;
};

const getToolName = (tool: unknown): string => getName(tool, FALLBACK_TOOL_NAME);

const toLatency = (timing?: VoiceTurnTiming): VoiceTurnLatency | null => {
  if (!timing) return null;
  const latency: VoiceTurnLatency = {
    speechToTextMs: timing.sttMs,
    endpointingMs: timing.endpointingMs,
    firstTokenMs: timing.llmFirstTokenMs,
    firstAudioMs: timing.ttsFirstAudioMs,
    callerToSpeakingMs: timing.callerToSpeakingMs,
    ttftMs: timing.ttftMs,
    durationMs: timing.durationMs,
  };
  return Object.values(latency).some(isNumber) ? latency : null;
};

const findAnnotationTurnIndex = (turns: VoiceCaptionTurn[], turnId: number | undefined): number => {
  if (turnId !== undefined) return turns.findIndex((turn) => turn.id === agentTurnId(turnId));
  const last = lastAgentTurnIndex(turns);
  return last !== -1 && !turns[last].text ? last : -1;
};

const appendToolCall = (
  snapshot: VoiceCallSnapshot,
  name: string,
  turnId: number | undefined,
): VoiceCallSnapshot => {
  const index = findAnnotationTurnIndex(snapshot.turns, turnId);

  if (index === -1) {
    const placeholder: VoiceCaptionTurn = {
      id: turnId !== undefined ? agentTurnId(turnId) : agentTurnId(snapshot.turns.length + 1),
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

const appendSkillCall = (
  snapshot: VoiceCallSnapshot,
  name: string,
  turnId: number | undefined,
): VoiceCallSnapshot => {
  const index = findAnnotationTurnIndex(snapshot.turns, turnId);

  if (index === -1) {
    const placeholder: VoiceCaptionTurn = {
      id: turnId !== undefined ? agentTurnId(turnId) : agentTurnId(snapshot.turns.length + 1),
      speaker: "agent",
      text: "",
      skillCalls: [name],
    };
    return { ...snapshot, turns: [...snapshot.turns, placeholder] };
  }

  const turn = snapshot.turns[index];
  return {
    ...snapshot,
    turns: replaceTurn(snapshot.turns, index, {
      ...turn,
      skillCalls: [...(turn.skillCalls ?? []), name],
    }),
  };
};

const appendCallerTurn = (
  turns: VoiceCaptionTurn[],
  turn: VoiceCaptionTurn,
): VoiceCaptionTurn[] => {
  const last = turns[turns.length - 1];
  // IMPORTANT NOTE: an annotation placeholder created before the caller spoke
  // belongs to the reply that follows, not above the utterance.
  const pendingReply = last?.speaker === "agent" && !last.text;
  return pendingReply ? [...turns.slice(0, -1), turn, last] : [...turns, turn];
};

const appendCallerInterim = (
  snapshot: VoiceCallSnapshot,
  event: VoiceServerEvent,
): VoiceCallSnapshot => {
  if (event.type !== "transcript.interim") return snapshot;

  const text = event.text.trim();
  if (!text) return snapshot;

  const last = snapshot.turns[snapshot.turns.length - 1];
  if (last?.speaker === "caller" && last.isInterim) {
    return {
      ...snapshot,
      turns: [...snapshot.turns.slice(0, -1), { ...last, text }],
    };
  }

  return {
    ...snapshot,
    turns: appendCallerTurn(snapshot.turns, {
      id: `${CALLER_TURN_PREFIX}-interim`,
      speaker: "caller",
      text,
      isInterim: true,
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
    const interimIndex = snapshot.turns.findIndex((turn) => turn.isInterim);
    if (interimIndex !== -1) {
      return { ...snapshot, turns: replaceTurn(snapshot.turns, interimIndex, callerTurn) };
    }
    return { ...snapshot, turns: appendCallerTurn(snapshot.turns, callerTurn) };
  }

  const id = event.turnId !== undefined ? agentTurnId(event.turnId) : null;
  const lastIndex = lastAgentTurnIndex(snapshot.turns);
  const matchingIndex = id !== null ? snapshot.turns.findIndex((turn) => turn.id === id) : -1;
  const placeholderIndex =
    matchingIndex === -1 && lastIndex !== -1 && !snapshot.turns[lastIndex].text ? lastIndex : -1;
  const index = matchingIndex !== -1 ? matchingIndex : placeholderIndex;

  if (index === -1) {
    const agentTurn: VoiceCaptionTurn = {
      id: id ?? agentTurnId(snapshot.turns.length + 1),
      speaker: "agent",
      text,
    };
    return { ...snapshot, turns: [...snapshot.turns, agentTurn] };
  }

  const turn = snapshot.turns[index];
  return {
    ...snapshot,
    turns: replaceTurn(snapshot.turns, index, {
      ...turn,
      id: id ?? turn.id,
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
    case "transcript.interim":
      return appendCallerInterim(active, event);
    case "tool.call":
      return appendToolCall(active, getToolName(event.tool), event.turnId);
    case "skill.call":
      return appendSkillCall(active, event.skill, event.turnId);
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
