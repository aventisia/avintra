import type { SampleVoiceAgent } from "../types/voice-agent-sample.type";

/** Stand-in agents until Phase 1 lists the tenant's published voice agents. */
export const SAMPLE_VOICE_AGENTS: SampleVoiceAgent[] = [
  {
    id: "sample-dental-receptionist",
    name: "Northwind Dental Receptionist",
    description: "Books, moves, and cancels dental appointments.",
    versionNumber: 3,
    language: "English (US)",
    voice: "Rachel · Calm",
    firstSpeaker: "ai",
    script: [
      {
        speaker: "agent",
        text: "Thanks for calling Northwind Dental. How can I help you today?",
        latency: { speechToTextMs: 0, firstTokenMs: 0, firstAudioMs: 650 },
      },
      { speaker: "caller", text: "Hi, can I book a cleaning for next week?" },
      {
        speaker: "agent",
        text: "Of course. Monday at 9 or Thursday at 3 are open. Which suits you?",
        toolCalls: [{ name: "check_availability", durationMs: 800 }],
        latency: { speechToTextMs: 220, firstTokenMs: 470, firstAudioMs: 1380 },
      },
      { speaker: "caller", text: "Thursday at 3 works." },
      {
        speaker: "agent",
        text: "You're booked for Thursday at 3 PM. I've sent a confirmation text. Anything else?",
        toolCalls: [{ name: "create_booking", durationMs: 900 }],
        latency: { speechToTextMs: 200, firstTokenMs: 440, firstAudioMs: 1240 },
      },
    ],
  },
  {
    id: "sample-it-helpdesk",
    name: "IT Helpdesk",
    description: "Resets passwords and logs IT tickets.",
    versionNumber: 5,
    language: "English (UK)",
    voice: "George · Warm",
    firstSpeaker: "human",
    script: [
      { speaker: "caller", text: "Hi, I'm locked out of my laptop." },
      {
        speaker: "agent",
        text: "Sorry about that. I've sent a reset link to your work phone. Can you open it now?",
        toolCalls: [{ name: "send_password_reset", durationMs: 1100 }],
        latency: { speechToTextMs: 240, firstTokenMs: 520, firstAudioMs: 1560 },
      },
      { speaker: "caller", text: "Got it, I'm back in. Thanks." },
      {
        speaker: "agent",
        text: "Great. I've logged ticket 4821 in case it happens again. Have a good day.",
        toolCalls: [{ name: "create_ticket", durationMs: 600 }],
        latency: { speechToTextMs: 190, firstTokenMs: 410, firstAudioMs: 1150 },
      },
    ],
  },
  {
    id: "sample-order-status",
    name: "Order Status Line",
    description: "Tracks orders and delivery dates.",
    versionNumber: 2,
    language: "English (US)",
    voice: "Nova",
    firstSpeaker: "ai",
    script: [
      {
        speaker: "agent",
        text: "Hi, you've reached order status. What's your order number?",
        latency: { speechToTextMs: 0, firstTokenMs: 0, firstAudioMs: 600 },
      },
      { speaker: "caller", text: "It's 7 7 3 1 2." },
      {
        speaker: "agent",
        text: "Order 77312 left our warehouse this morning and should arrive Friday.",
        toolCalls: [{ name: "lookup_order", durationMs: 700 }],
        latency: { speechToTextMs: 260, firstTokenMs: 450, firstAudioMs: 1290 },
      },
    ],
  },
];
