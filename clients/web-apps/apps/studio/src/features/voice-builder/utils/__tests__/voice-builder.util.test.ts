import { describe, expect, it } from "vitest";

import { VOICE_FIELDS } from "../../constants/voice-builder.constant";
import type { VoiceReadinessCheck } from "../../types/voice-builder.type";
import {
  formatPendingSections,
  getPendingVoiceChecks,
  getPromptStageMarks,
  getVoiceReadiness,
  isRealtimeReady,
} from "../voice-builder.util";

const READY_PIPELINE = {
  [VOICE_FIELDS.goal]: "Book calls",
  [VOICE_FIELDS.speechToText]: { model: "nova-3" },
  [VOICE_FIELDS.languageModel]: { provider: "openai", model: "gpt-4o" },
  [VOICE_FIELDS.textToSpeech]: { model: "sonic-2" },
  [VOICE_FIELDS.voiceConfig]: { voice: "alloy" },
};

const READY_REALTIME_MODEL = {
  provider: "openai",
  model: "gpt-realtime",
  credential_name: "openai-key",
};

describe("getPromptStageMarks", () => {
  it("marks persona and instructions to do while neither goal nor instructions is set", () => {
    expect(getPromptStageMarks({})).toEqual({
      persona: "todo",
      instructions: "todo",
      opening: "ready",
      variables: "idle",
    });
    expect(getPromptStageMarks({ [VOICE_FIELDS.role]: "Receptionist" })).toMatchObject({
      persona: "todo",
      instructions: "todo",
    });
  });

  it("marks a filled stage ready and an empty optional one idle once the tab rule passes", () => {
    expect(getPromptStageMarks({ [VOICE_FIELDS.goal]: "Book calls" })).toMatchObject({
      persona: "ready",
      instructions: "idle",
    });
    expect(getPromptStageMarks({ [VOICE_FIELDS.instructions]: "Be brief" })).toMatchObject({
      persona: "idle",
      instructions: "ready",
    });
  });

  it("marks opening to do only when the agent speaks first with no introduction", () => {
    expect(getPromptStageMarks({ [VOICE_FIELDS.firstSpeaker]: "ai" }).opening).toBe("todo");
    expect(
      getPromptStageMarks({ [VOICE_FIELDS.firstSpeaker]: "ai", [VOICE_FIELDS.introduction]: "Hi" })
        .opening,
    ).toBe("ready");
    expect(
      getPromptStageMarks({ [VOICE_FIELDS.firstSpeaker]: "human", [VOICE_FIELDS.introduction]: "" })
        .opening,
    ).toBe("ready");
  });

  it("marks variables to do for undefined placeholders, even while switched off", () => {
    expect(getPromptStageMarks({ [VOICE_FIELDS.goal]: "Help {{name}}" }).variables).toBe("todo");
    expect(
      getPromptStageMarks({
        [VOICE_FIELDS.goal]: "Help {{name}}",
        [VOICE_FIELDS.variablesEnabled]: true,
        [VOICE_FIELDS.variables]: { name: "" },
      }).variables,
    ).toBe("ready");
    expect(
      getPromptStageMarks({
        [VOICE_FIELDS.variablesEnabled]: true,
        [VOICE_FIELDS.variables]: {},
      }).variables,
    ).toBe("idle");
  });
});

describe("getVoiceReadiness", () => {
  it("passes the prompt and engine checks once every pipeline step is set", () => {
    expect(getVoiceReadiness(READY_PIPELINE)).toEqual([
      { section: "prompt", label: "Prompt", hint: "", isReady: true },
      { section: "engine", label: "Engine", hint: "", isReady: true },
    ]);
  });

  it("asks for the language model before the speech models", () => {
    expect(
      getVoiceReadiness({
        ...READY_PIPELINE,
        [VOICE_FIELDS.languageModel]: { provider: "openai" },
      })[1],
    ).toMatchObject({ isReady: false, hint: "Pick a language model." });
    expect(
      getVoiceReadiness({ ...READY_PIPELINE, [VOICE_FIELDS.voiceConfig]: {} })[1],
    ).toMatchObject({
      isReady: false,
      hint: "Pick speech-to-text and text-to-speech models, and a voice.",
    });
  });

  it("judges a realtime agent by its realtime model alone", () => {
    const realtime = {
      [VOICE_FIELDS.goal]: "Book calls",
      [VOICE_FIELDS.engineMode]: "realtime",
      [VOICE_FIELDS.realtimeModel]: READY_REALTIME_MODEL,
    };
    expect(getVoiceReadiness(realtime)[1]).toMatchObject({ section: "engine", isReady: true });
  });

  it("requires an introduction when the agent speaks first", () => {
    expect(
      getVoiceReadiness({ ...READY_PIPELINE, [VOICE_FIELDS.firstSpeaker]: "ai" })[0],
    ).toMatchObject({ isReady: false, hint: "Write what the agent says first." });
  });
});

describe("isRealtimeReady", () => {
  it("requires a provider, a model, and a credential name", () => {
    expect(isRealtimeReady({ [VOICE_FIELDS.realtimeModel]: READY_REALTIME_MODEL })).toBe(true);
    expect(
      isRealtimeReady({
        [VOICE_FIELDS.realtimeModel]: { ...READY_REALTIME_MODEL, credential_name: " " },
      }),
    ).toBe(false);
    expect(
      isRealtimeReady({ [VOICE_FIELDS.realtimeModel]: { ...READY_REALTIME_MODEL, model: "" } }),
    ).toBe(false);
    expect(isRealtimeReady({})).toBe(false);
  });
});

describe("getPendingVoiceChecks", () => {
  it("returns only the failing checks, in tab order", () => {
    expect(getPendingVoiceChecks({}).map((check) => check.section)).toEqual(["prompt", "engine"]);
    expect(
      getPendingVoiceChecks({ ...READY_PIPELINE, [VOICE_FIELDS.goal]: "" }).map(
        (check) => check.section,
      ),
    ).toEqual(["prompt"]);
    expect(getPendingVoiceChecks(READY_PIPELINE)).toEqual([]);
  });
});

describe("formatPendingSections", () => {
  const pending = (label: string): VoiceReadinessCheck => ({
    section: "prompt",
    label,
    hint: "",
    isReady: false,
  });

  it("joins section labels into a readable list", () => {
    expect(formatPendingSections([])).toBe("");
    expect(formatPendingSections([pending("Prompt")])).toBe("Prompt");
    expect(formatPendingSections([pending("Prompt"), pending("Engine")])).toBe("Prompt and Engine");
    expect(formatPendingSections([pending("Prompt"), pending("Engine"), pending("Tools")])).toBe(
      "Prompt, Engine and Tools",
    );
  });
});
