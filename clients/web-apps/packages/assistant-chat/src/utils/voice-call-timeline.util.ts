import type {
  VoiceCallFrame,
  VoiceCallScriptTurn,
  VoiceCallState,
  VoiceCaptionTurn,
  VoiceToolCall,
} from "../types/voice-call.type";

const CONNECT_MS = 1200;
const CALLER_PAUSE_MS = 1400;
const CALLER_WORD_MS = 210;
const AGENT_WORD_MS = 150;
const DEFAULT_FIRST_AUDIO_MS = 900;

const splitWords = (text: string) => text.split(/\s+/).filter(Boolean);

/** Expands a scripted conversation into timed frames for a simulated voice call. */
export const buildVoiceCallTimeline = (script: VoiceCallScriptTurn[]): VoiceCallFrame[] => {
  const frames: VoiceCallFrame[] = [];
  const finished: VoiceCaptionTurn[] = [];
  let at = 0;

  const push = (state: VoiceCallState, live?: VoiceCaptionTurn) =>
    frames.push({ at, state, turns: live ? [...finished, live] : [...finished] });

  push("connecting");
  at += CONNECT_MS;

  script.forEach((turn, index) => {
    const id = `turn-${index}`;
    const words = splitWords(turn.text);

    if (turn.speaker === "caller") {
      push("listening");
      at += CALLER_PAUSE_MS;
      words.forEach((_, count) => {
        const text = words.slice(0, count + 1).join(" ");
        push("listening", { id, speaker: "caller", text, isInterim: true });
        at += CALLER_WORD_MS;
      });
      finished.push({ id, speaker: "caller", text: turn.text });
      return;
    }

    const doneTools: VoiceToolCall[] = [];
    push("thinking");
    at += turn.latency?.firstTokenMs ?? DEFAULT_FIRST_AUDIO_MS / 2;

    for (const tool of turn.toolCalls ?? []) {
      const running = { ...tool, isRunning: true };
      push("thinking", { id, speaker: "agent", text: "", toolCalls: [...doneTools, running] });
      at += tool.durationMs;
      doneTools.push(tool);
    }

    const latency = turn.latency;
    const toolCalls = doneTools.length ? doneTools : undefined;
    at += Math.max(
      0,
      (latency?.firstAudioMs ?? DEFAULT_FIRST_AUDIO_MS) - (latency?.firstTokenMs ?? 0),
    );
    words.forEach((_, count) => {
      const text = words.slice(0, count + 1).join(" ");
      push("speaking", { id, speaker: "agent", text, toolCalls, latency });
      at += AGENT_WORD_MS;
    });
    finished.push({ id, speaker: "agent", text: turn.text, toolCalls, latency });
  });

  push("listening");
  return frames;
};

/** Returns the frame showing at `elapsedMs`; frames must be sorted by `at`. */
export const getVoiceCallFrame = (frames: VoiceCallFrame[], elapsedMs: number): VoiceCallFrame => {
  let current = frames[0];
  for (const frame of frames) {
    if (frame.at > elapsedMs) break;
    current = frame;
  }
  return current;
};
