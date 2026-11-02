import type { VoiceCallScriptTurn } from "@avplatform/assistant-chat";

import type { VoiceAgentTemplate, VoiceBuilderSectionId } from "../types/voice-builder.type";

export const VOICE_FIELDS = {
  goal: "__Goal__Voice",
  role: "__Role__Voice",
  instructions: "__Instructions__Voice",
  firstSpeaker: "__FirstSpeaker__Voice",
  introduction: "__Introduction__Voice",
  languageModel: "__ModelConfig__Voice",
  speechToText: "__ModelConfig__SpeechToText",
  textToSpeech: "__ModelConfig__TextToSpeech",
  voiceConfig: "__VoiceConfig__TextToSpeech",
  variablesEnabled: "__VariablesEnabled__Voice",
  variables: "__Variables__Voice",
  knowledgeBases: "__KbConfig__Voice",
  skills: "__SkillsConfig__Voice",
  memory: "__MemoryConfig__Voice",
  tools: "__ToolsConfig__Voice",
} as const;

export const VOICE_BUILDER_SECTIONS: { id: VoiceBuilderSectionId; label: string }[] = [
  { id: "persona", label: "Persona" },
  { id: "opening", label: "Opening" },
  { id: "voice", label: "Voice" },
  { id: "brain", label: "Brain" },
  { id: "knowledge", label: "Knowledge & tools" },
  { id: "pronunciation", label: "Pronunciation & variables" },
  { id: "later", label: "Coming later" },
];

export const VOICE_AGENT_TEMPLATES: VoiceAgentTemplate[] = [
  {
    id: "receptionist",
    name: "Receptionist",
    description: "Answers questions, shares opening hours, and takes messages.",
    role: "You are the friendly front-desk receptionist for {{business_name}}.",
    goal: "Answer caller questions about the business and take a message when you cannot help.",
    instructions:
      "Keep every reply under two sentences. Read names and phone numbers back to confirm them. If the caller asks for a person, take a message with their name, number, and reason for calling.",
    introduction: "Thanks for calling {{business_name}}. How can I help you today?",
  },
  {
    id: "booking",
    name: "Booking",
    description: "Books, moves, and cancels appointments.",
    role: "You are the booking assistant for {{business_name}}.",
    goal: "Book, reschedule, or cancel the caller's appointment.",
    instructions:
      "Ask for the caller's name and preferred date before checking availability. Offer at most three time slots at a time. Repeat the final booking back before you end the call.",
    introduction:
      "Hi, this is the booking line for {{business_name}}. Are you looking to book, move, or cancel an appointment?",
  },
  {
    id: "support-triage",
    name: "Support triage",
    description: "Works out the problem and flags urgent calls for a person.",
    role: "You are the first-line support agent for {{business_name}}.",
    goal: "Understand the caller's problem, solve simple issues, and flag urgent ones for a person.",
    instructions:
      "Ask one question at a time. Search the knowledge base before answering product questions. If the caller reports an outage or a safety issue, tell them a person will call back within 15 minutes.",
    introduction: "You've reached {{business_name}} support. What can I help you with?",
  },
];

/** Deferred settings, shown read-only so the team sees where they will land. */
export const VOICE_COMING_LATER: { phase: string; items: string[] }[] = [
  {
    phase: "Phase 4",
    items: ["Escalation to a person", "Transcript webhook", "Phone and widget channels"],
  },
  { phase: "Phase 5", items: ["Realtime engine", "Preemptive generation", "Noise cancellation"] },
  {
    phase: "Phase 6",
    items: ["Manager agent", "Call recording", "Custom sounds", "Avatar", "Screen share", "Camera"],
  },
];

/** Sample conversation the test console plays after the configured introduction. */
export const VOICE_TEST_CALL_SCRIPT: VoiceCallScriptTurn[] = [
  { speaker: "caller", text: "Hi, I'd like to move my appointment on Thursday to next week." },
  {
    speaker: "agent",
    text: "Sure. I found your Thursday 10 AM booking. Next Tuesday at 10 or Wednesday at 2 are open. Which works?",
    toolCalls: [{ name: "lookup_booking", durationMs: 700 }],
    latency: { speechToTextMs: 210, firstTokenMs: 480, firstAudioMs: 1320 },
  },
  { speaker: "caller", text: "Tuesday at 10, please." },
  {
    speaker: "agent",
    text: "Done. You're booked for Tuesday at 10 AM, and I've sent a confirmation text. Anything else?",
    toolCalls: [{ name: "reschedule_booking", durationMs: 900 }],
    latency: { speechToTextMs: 190, firstTokenMs: 430, firstAudioMs: 1180 },
  },
  { speaker: "caller", text: "No, that's all. Thanks!" },
  {
    speaker: "agent",
    text: "You're welcome. Have a great day.",
    latency: { speechToTextMs: 170, firstTokenMs: 390, firstAudioMs: 940 },
  },
];
