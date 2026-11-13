import { describe, expect, it } from "vitest";

import type {
  VoiceCallSnapshot,
  VoiceServerEvent,
  VoiceTurnTiming,
} from "../types/voice-session.type";
import { VOICE_EVENT_TOPIC, applyVoiceEvent, parseVoiceEvent } from "./voice-events";

const CONVERSATION_ID = "conversation-1";

const encode = (payload: unknown): Uint8Array => new TextEncoder().encode(JSON.stringify(payload));

const parse = (payload: unknown, topic?: string): VoiceServerEvent | null =>
  parseVoiceEvent(encode(payload), topic);

const basePayload = { conversationId: CONVERSATION_ID, timestamp: 1 };

const createSnapshot = (patch: Partial<VoiceCallSnapshot> = {}): VoiceCallSnapshot => ({
  state: "idle",
  isActive: false,
  turns: [],
  callMs: 0,
  isMuted: false,
  error: null,
  conversationId: null,
  needsAudioResume: false,
  ...patch,
});

const activeSnapshot = (patch: Partial<VoiceCallSnapshot> = {}): VoiceCallSnapshot =>
  createSnapshot({ state: "listening", isActive: true, conversationId: CONVERSATION_ID, ...patch });

const turnTiming = (patch: Partial<VoiceTurnTiming> = {}): VoiceTurnTiming => ({
  sttMs: 300,
  llmFirstTokenMs: 500,
  ttsFirstAudioMs: 800,
  turnTotalMs: 1200,
  endpointingMs: 250,
  callerToSpeakingMs: 1350,
  ttftMs: null,
  durationMs: null,
  ...patch,
});

describe("parseVoiceEvent", () => {
  it("decodes every contract event type", () => {
    expect(
      parse({ ...basePayload, type: "session.state", state: "speaking", previousState: "idle" }),
    ).toEqual({
      type: "session.state",
      conversationId: CONVERSATION_ID,
      state: "speaking",
      previousState: "idle",
    });

    expect(
      parse({ ...basePayload, type: "transcript.final", role: "assistant", text: "hi", turnId: 2 }),
    ).toEqual({
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "hi",
      turnId: 2,
    });

    expect(
      parse({ ...basePayload, type: "transcript.interim", role: "user", text: "hel" }),
    ).toEqual({
      type: "transcript.interim",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "hel",
    });

    expect(
      parse({ ...basePayload, type: "tool.call", tool: { name: "search" }, turnId: 2 }),
    ).toEqual({
      type: "tool.call",
      conversationId: CONVERSATION_ID,
      tool: { name: "search" },
      turnId: 2,
    });

    expect(parse({ ...basePayload, type: "skill.call", skill: "demo-skill", turnId: 2 })).toEqual({
      type: "skill.call",
      conversationId: CONVERSATION_ID,
      skill: "demo-skill",
      turnId: 2,
    });

    expect(
      parse({
        ...basePayload,
        type: "timing",
        stage: "turn",
        turnId: 2,
        interrupted: false,
        voice_turn_timing: {
          stt_ms: 300,
          llm_first_token_ms: 500,
          tts_first_audio_ms: 800,
          turn_total_ms: 1200,
        },
      }),
    ).toEqual({
      type: "timing",
      conversationId: CONVERSATION_ID,
      stage: "turn",
      durationMs: undefined,
      turnId: 2,
      interrupted: false,
      voiceTurnTiming: turnTiming({ endpointingMs: null, callerToSpeakingMs: null }),
    });

    expect(
      parse({
        ...basePayload,
        type: "error",
        code: "invalid_config",
        message: "bad model",
        retryable: true,
      }),
    ).toEqual({
      type: "error",
      conversationId: CONVERSATION_ID,
      code: "invalid_config",
      message: "bad model",
      retryable: true,
      turnId: undefined,
    });

    expect(
      parse({ ...basePayload, type: "session.closed", reason: "user_initiated", code: 1000 }),
    ).toEqual({
      type: "session.closed",
      conversationId: CONVERSATION_ID,
      code: 1000,
      reason: "user_initiated",
    });
  });

  it("reads timing values as null when the worker leaves them unset", () => {
    const event = parse({
      ...basePayload,
      type: "timing",
      stage: "turn",
      turnId: 1,
      interrupted: true,
      voice_turn_timing: { stt_ms: 300, llm_first_token_ms: null, tts_first_audio_ms: null },
    });

    expect(event).toMatchObject({
      voiceTurnTiming: {
        sttMs: 300,
        llmFirstTokenMs: null,
        ttsFirstAudioMs: null,
        turnTotalMs: null,
        endpointingMs: null,
        callerToSpeakingMs: null,
        ttftMs: null,
        durationMs: null,
      },
    });
  });

  it("ignores other topics", () => {
    expect(
      parse({ ...basePayload, type: "session.state", state: "idle" }, "other.topic"),
    ).toBeNull();
    expect(
      parse({ ...basePayload, type: "session.state", state: "idle" }, VOICE_EVENT_TOPIC),
    ).not.toBeNull();
  });

  it("ignores malformed JSON", () => {
    expect(parseVoiceEvent(new TextEncoder().encode("{not-json"))).toBeNull();
    expect(parseVoiceEvent(new Uint8Array())).toBeNull();
  });

  it("ignores unknown event types", () => {
    expect(parse({ ...basePayload, type: "agent.thought" })).toBeNull();
  });

  it("requires a type and conversation id", () => {
    expect(parse({ conversationId: CONVERSATION_ID })).toBeNull();
    expect(parse({ type: "session.state", state: "idle" })).toBeNull();
  });

  it("rejects transcripts with an unknown role or missing text", () => {
    expect(
      parse({ ...basePayload, type: "transcript.final", role: "system", text: "x" }),
    ).toBeNull();
    expect(parse({ ...basePayload, type: "transcript.final", role: "user" })).toBeNull();
    expect(
      parse({ ...basePayload, type: "transcript.interim", role: "assistant", text: "x" }),
    ).toBeNull();
    expect(parse({ ...basePayload, type: "transcript.interim", role: "user" })).toBeNull();
  });

  it("rejects timing with an unknown stage", () => {
    expect(parse({ ...basePayload, type: "timing", stage: "call" })).toBeNull();
  });
});

describe("applyVoiceEvent", () => {
  it("maps worker states to call states while active", () => {
    const snapshot = activeSnapshot();
    const stateEvent = (state: string): VoiceServerEvent => ({
      type: "session.state",
      conversationId: CONVERSATION_ID,
      state,
    });

    expect(applyVoiceEvent(snapshot, stateEvent("idle")).state).toBe("listening");
    expect(applyVoiceEvent(snapshot, stateEvent("processing")).state).toBe("thinking");
    expect(applyVoiceEvent(snapshot, stateEvent("speaking")).state).toBe("speaking");
    expect(applyVoiceEvent(snapshot, stateEvent("connecting")).state).toBe("connecting");
    expect(applyVoiceEvent(snapshot, stateEvent("sleeping")).state).toBe("listening");
  });

  it("ignores non-terminal events once the call is inactive", () => {
    const snapshot = createSnapshot();
    const event: VoiceServerEvent = {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "hello",
    };

    expect(applyVoiceEvent(snapshot, event)).toBe(snapshot);
  });

  it("adds caller turns for user transcripts", () => {
    const next = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "  book a call  ",
    });

    expect(next.turns).toEqual([{ id: "caller-1", speaker: "caller", text: "book a call" }]);
  });

  it("replaces the caller interim caption as the transcript grows and finalizes it", () => {
    const first = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.interim",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "book",
    });
    const second = applyVoiceEvent(first, {
      type: "transcript.interim",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "book a call",
    });

    expect(second.turns).toEqual([
      { id: "caller-interim", speaker: "caller", text: "book a call", isInterim: true },
    ]);

    const final = applyVoiceEvent(second, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "book a call today",
    });

    expect(final.turns).toEqual([{ id: "caller-2", speaker: "caller", text: "book a call today" }]);
  });

  it("keeps a caller interim caption separate from an earlier finalized caller turn", () => {
    const first = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "hello",
    });
    const next = applyVoiceEvent(first, {
      type: "transcript.interim",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "and",
    });

    expect(next.turns).toEqual([
      { id: "caller-1", speaker: "caller", text: "hello" },
      { id: "caller-interim", speaker: "caller", text: "and", isInterim: true },
    ]);
  });

  it("keys assistant turns by turnId and updates the existing turn", () => {
    const first = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "first",
      turnId: 3,
    });
    const second = applyVoiceEvent(first, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "second",
      turnId: 3,
    });

    expect(second.turns).toEqual([{ id: "turn-3", speaker: "agent", text: "second" }]);
  });

  it("keeps the spoken introduction and the first reply as separate turns", () => {
    const withIntro = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "Hi Alice from Acme.",
      turnId: 0,
    });
    const withReply = applyVoiceEvent(withIntro, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "How can I help?",
      turnId: 1,
    });

    expect(withReply.turns).toEqual([
      { id: "turn-0", speaker: "agent", text: "Hi Alice from Acme." },
      { id: "turn-1", speaker: "agent", text: "How can I help?" },
    ]);
  });

  it("creates a running tool placeholder when the tool arrives before the text", () => {
    const withTool = applyVoiceEvent(activeSnapshot(), {
      type: "tool.call",
      conversationId: CONVERSATION_ID,
      tool: { name: "create_ticket" },
      turnId: 4,
    });

    expect(withTool.turns).toEqual([
      {
        id: "turn-4",
        speaker: "agent",
        text: "",
        toolCalls: [{ name: "create_ticket", isRunning: true }],
      },
    ]);

    const withText = applyVoiceEvent(withTool, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "Ticket created.",
      turnId: 4,
    });

    expect(withText.turns[0]).toEqual({
      id: "turn-4",
      speaker: "agent",
      text: "Ticket created.",
      toolCalls: [{ name: "create_ticket", isRunning: false }],
    });
  });

  it("fills the realtime tool placeholder with the reply that follows", () => {
    const withTool = applyVoiceEvent(activeSnapshot(), {
      type: "tool.call",
      conversationId: CONVERSATION_ID,
      tool: { name: "create_ticket" },
    });
    const withText = applyVoiceEvent(withTool, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "Ticket created.",
    });

    expect(withText.turns).toEqual([
      {
        id: "turn-1",
        speaker: "agent",
        text: "Ticket created.",
        toolCalls: [{ name: "create_ticket", isRunning: false }],
      },
    ]);
  });

  it("starts a new placeholder when a realtime tool call follows a spoken reply", () => {
    const withReply = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "First answer.",
      turnId: 1,
    });
    const withTool = applyVoiceEvent(withReply, {
      type: "tool.call",
      conversationId: CONVERSATION_ID,
      tool: { name: "create_ticket" },
    });
    const withNext = applyVoiceEvent(withTool, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "Ticket created.",
    });

    expect(withNext.turns).toEqual([
      { id: "turn-1", speaker: "agent", text: "First answer." },
      {
        id: "turn-2",
        speaker: "agent",
        text: "Ticket created.",
        toolCalls: [{ name: "create_ticket", isRunning: false }],
      },
    ]);
  });

  it("shows configured skills on the first reply turn", () => {
    const withSkill = applyVoiceEvent(activeSnapshot(), {
      type: "skill.call",
      conversationId: CONVERSATION_ID,
      skill: "demo-skill",
    });
    const withText = applyVoiceEvent(withSkill, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "Hello.",
    });

    expect(withText.turns).toEqual([
      {
        id: "turn-1",
        speaker: "agent",
        text: "Hello.",
        skillCalls: ["demo-skill"],
      },
    ]);
  });

  it("keeps the skill chip with the reply when the caller speaks first", () => {
    const withSkill = applyVoiceEvent(activeSnapshot(), {
      type: "skill.call",
      conversationId: CONVERSATION_ID,
      skill: "demo-skill",
    });
    const withCaller = applyVoiceEvent(withSkill, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "Hi.",
    });
    const withReply = applyVoiceEvent(withCaller, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "Hello.",
    });

    expect(withReply.turns).toEqual([
      { id: "caller-2", speaker: "caller", text: "Hi." },
      { id: "turn-1", speaker: "agent", text: "Hello.", skillCalls: ["demo-skill"] },
    ]);
  });

  it("moves a skill placeholder onto the first reply after an introduction", () => {
    const withIntro = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "Hi Alice from Acme.",
      turnId: 0,
    });
    const withSkill = applyVoiceEvent(withIntro, {
      type: "skill.call",
      conversationId: CONVERSATION_ID,
      skill: "demo-skill",
    });
    const withReply = applyVoiceEvent(withSkill, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "How can I help?",
      turnId: 1,
    });

    expect(withReply.turns).toEqual([
      { id: "turn-0", speaker: "agent", text: "Hi Alice from Acme." },
      {
        id: "turn-1",
        speaker: "agent",
        text: "How can I help?",
        skillCalls: ["demo-skill"],
      },
    ]);
  });

  it("keeps a skill call keyed by turnId when the worker sends one", () => {
    const withTurn = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "Done.",
      turnId: 7,
    });
    const withSkill = applyVoiceEvent(withTurn, {
      type: "skill.call",
      conversationId: CONVERSATION_ID,
      skill: "demo-skill",
      turnId: 7,
    });

    expect(withSkill.turns[0]).toEqual({
      id: "turn-7",
      speaker: "agent",
      text: "Done.",
      skillCalls: ["demo-skill"],
    });
  });

  it("adds a completed tool call when the turn already has text", () => {
    const withText = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "Done.",
      turnId: 5,
    });
    const withTool = applyVoiceEvent(withText, {
      type: "tool.call",
      conversationId: CONVERSATION_ID,
      tool: "search",
      turnId: 5,
    });

    expect(withTool.turns[0].toolCalls).toEqual([{ name: "search" }]);
  });

  it("extracts the tool label from the engine payload and falls back to Tool", () => {
    const labelFor = (tool: unknown) => {
      const next = applyVoiceEvent(activeSnapshot(), {
        type: "tool.call",
        conversationId: CONVERSATION_ID,
        tool,
        turnId: 1,
      });
      return next.turns[0].toolCalls?.[0].name;
    };

    expect(labelFor("lookup")).toBe("lookup");
    expect(labelFor({ name: "name_tool" })).toBe("name_tool");
    expect(labelFor({ tool: "tool_field" })).toBe("tool_field");
    expect(labelFor({ tool_name: "tool_name_field" })).toBe("tool_name_field");
    expect(labelFor({ arguments: {} })).toBe("Tool");
    expect(labelFor(null)).toBe("Tool");
  });

  it("attaches timing when the turn carries a measurement and skips empty or interrupted turns", () => {
    const withTurn = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "hello",
      turnId: 6,
    });
    const timingEvent = (voiceTurnTiming: VoiceTurnTiming): VoiceServerEvent => ({
      type: "timing",
      conversationId: CONVERSATION_ID,
      stage: "turn",
      turnId: 6,
      interrupted: false,
      voiceTurnTiming,
    });

    const withLatency = applyVoiceEvent(withTurn, timingEvent(turnTiming()));
    expect(withLatency.turns[0].latency).toEqual({
      speechToTextMs: 300,
      endpointingMs: 250,
      firstTokenMs: 500,
      firstAudioMs: 800,
      callerToSpeakingMs: 1350,
      ttftMs: null,
      durationMs: null,
    });

    const realtime = applyVoiceEvent(
      withTurn,
      timingEvent(
        turnTiming({
          sttMs: null,
          llmFirstTokenMs: null,
          ttsFirstAudioMs: null,
          turnTotalMs: null,
          endpointingMs: null,
          callerToSpeakingMs: null,
          ttftMs: 420,
          durationMs: 2100,
        }),
      ),
    );
    expect(realtime.turns[0].latency).toMatchObject({ ttftMs: 420, durationMs: 2100 });

    const empty = applyVoiceEvent(
      withTurn,
      timingEvent(
        turnTiming({
          sttMs: null,
          llmFirstTokenMs: null,
          ttsFirstAudioMs: null,
          turnTotalMs: null,
          endpointingMs: null,
          callerToSpeakingMs: null,
        }),
      ),
    );
    expect(empty.turns[0].latency).toBeUndefined();

    const interrupted = applyVoiceEvent(withTurn, {
      type: "timing",
      conversationId: CONVERSATION_ID,
      stage: "turn",
      turnId: 6,
      interrupted: true,
      voiceTurnTiming: turnTiming(),
    });
    expect(interrupted.turns[0].latency).toBeUndefined();
  });

  it("ignores session-stage timing", () => {
    const snapshot = activeSnapshot();
    expect(
      applyVoiceEvent(snapshot, {
        type: "timing",
        conversationId: CONVERSATION_ID,
        stage: "session",
        durationMs: 10_000,
      }),
    ).toBe(snapshot);
  });

  it("keeps the call active when the worker reports a recoverable error", () => {
    const next = applyVoiceEvent(activeSnapshot(), {
      type: "error",
      conversationId: CONVERSATION_ID,
      code: "invalid_config",
      message: "STT model missing",
      retryable: false,
    });

    expect(next.isActive).toBe(true);
    expect(next.state).toBe("listening");
    expect(next.error).toEqual({
      code: "invalid_config",
      message: "STT model missing",
      retryable: false,
    });
  });

  it("clears a previous error once the session makes progress", () => {
    const failed = applyVoiceEvent(activeSnapshot(), {
      type: "error",
      conversationId: CONVERSATION_ID,
      code: "invalid_config",
      message: "STT model missing",
      retryable: true,
    });
    expect(failed.error).not.toBeNull();

    const recovered = applyVoiceEvent(failed, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "hello",
    });

    expect(recovered.error).toBeNull();
    expect(recovered.isActive).toBe(true);
  });

  it("ends the call on a normal close", () => {
    const next = applyVoiceEvent(activeSnapshot(), {
      type: "session.closed",
      conversationId: CONVERSATION_ID,
      code: 1000,
      reason: "user_initiated",
    });

    expect(next).toMatchObject({ state: "ended", isActive: false, needsAudioResume: false });
  });

  it("reports a failed close code as an error", () => {
    const next = applyVoiceEvent(activeSnapshot(), {
      type: "session.closed",
      conversationId: CONVERSATION_ID,
      code: 4403,
      reason: "credentials_unavailable",
    });

    expect(next.state).toBe("error");
    expect(next.isActive).toBe(false);
    expect(next.error?.code).toBe("4403");
    expect(next.error?.retryable).toBe(false);
  });

  it("handles a close without a code as an error", () => {
    const next = applyVoiceEvent(activeSnapshot(), {
      type: "session.closed",
      conversationId: CONVERSATION_ID,
    });

    expect(next.state).toBe("error");
    expect(next.error?.code).toBe("unknown");
  });

  it("keeps caller and agent turns in arrival order", () => {
    const afterCaller = applyVoiceEvent(activeSnapshot(), {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "user",
      text: "hello",
    });
    const afterAgent = applyVoiceEvent(afterCaller, {
      type: "transcript.final",
      conversationId: CONVERSATION_ID,
      role: "assistant",
      text: "hi there",
      turnId: 1,
    });

    expect(afterAgent.turns.map((turn) => turn.speaker)).toEqual(["caller", "agent"]);
  });
});
