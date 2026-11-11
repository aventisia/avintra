import type { VoiceCaptionTurn } from "@avplatform/assistant-chat";

import type { VoiceConversation } from "../types/voice-conversation.type";

type VoiceConversationSampleTurn = Omit<VoiceCaptionTurn, "id">;

const toTurns = (script: VoiceConversationSampleTurn[]): VoiceCaptionTurn[] =>
  script.map((turn, index) => ({ ...turn, id: `turn-${index}` }));

const latency = (speechToTextMs: number, firstTokenMs: number, firstAudioMs: number) => ({
  speechToTextMs,
  firstTokenMs,
  firstAudioMs,
  endpointingMs: null,
  callerToSpeakingMs: null,
  ttftMs: null,
  durationMs: null,
});

export const SAMPLE_VOICE_CONVERSATIONS: VoiceConversation[] = [
  {
    id: "vc-1042",
    startedAt: "2026-11-02T10:42:00",
    callerName: "Priya Nair",
    channel: "workspace",
    versionNumber: 3,
    durationMs: 134_000,
    outcome: "completed",
    turns: toTurns([
      { speaker: "agent", text: "Hi, thanks for calling Northwind Dental. How can I help today?" },
      { speaker: "caller", text: "I need to move my cleaning on Thursday to next week." },
      {
        speaker: "agent",
        text: "Sure. I can see your cleaning on Thursday at 3 PM. Next Tuesday at 10 or Wednesday at 2 are open. Which works?",
        toolCalls: [{ name: "lookup_booking", durationMs: 420 }],
        latency: latency(240, 380, 1100),
      },
      { speaker: "caller", text: "Wednesday at two, please." },
      {
        speaker: "agent",
        text: "Done. You're booked for Wednesday at 2 PM, and I've sent a confirmation text.",
        toolCalls: [{ name: "reschedule_booking", durationMs: 610 }],
        latency: latency(210, 350, 1240),
      },
      { speaker: "caller", text: "Perfect, thank you." },
      {
        speaker: "agent",
        text: "You're welcome. Have a great day!",
        latency: latency(190, 300, 820),
      },
    ]),
  },
  {
    id: "vc-1041",
    startedAt: "2026-11-02T09:15:00",
    callerName: "You (test)",
    channel: "test",
    versionNumber: 4,
    durationMs: 48_000,
    outcome: "completed",
    turns: toTurns([
      { speaker: "agent", text: "Hi, thanks for calling Northwind Dental. How can I help today?" },
      { speaker: "caller", text: "What are your opening hours on Saturday?" },
      {
        speaker: "agent",
        text: "On Saturdays we're open from 9 AM to 1 PM. Would you like to book a visit?",
        toolCalls: [{ name: "search_knowledge", durationMs: 330 }],
        latency: latency(220, 410, 1180),
      },
      { speaker: "caller", text: "Not right now, thanks." },
      { speaker: "agent", text: "No problem. Goodbye!", latency: latency(180, 290, 760) },
    ]),
  },
  {
    id: "vc-1039",
    startedAt: "2026-11-01T16:03:00",
    callerName: "Marcus Lee",
    channel: "workspace",
    versionNumber: 3,
    durationMs: 21_000,
    outcome: "caller-hung-up",
    turns: toTurns([
      { speaker: "agent", text: "Hi, thanks for calling Northwind Dental. How can I help today?" },
      { speaker: "caller", text: "Can I speak to someone about a bill?" },
      {
        speaker: "agent",
        text: "I can help with billing questions. Could you tell me the name on the account?",
        latency: latency(260, 520, 1720),
      },
    ]),
  },
  {
    id: "vc-1036",
    startedAt: "2026-11-01T11:27:00",
    callerName: "You (test)",
    channel: "test",
    versionNumber: 2,
    durationMs: 12_000,
    outcome: "error",
    errorMessage:
      "The text-to-speech model is not enabled for this tenant, so the agent could not reply.",
    turns: toTurns([{ speaker: "caller", text: "Hello, is anyone there?" }]),
  },
];
