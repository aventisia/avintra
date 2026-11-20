import { describe, expect, it } from "vitest";

import { VOICE_FIELDS } from "../../constants/voice-builder.constant";
import type { VoiceReadinessCheck } from "../../types/voice-builder.type";
import {
  formatPendingSections,
  getInactiveEngineModelFields,
  getInstructionVariables,
  getPendingVoiceChecks,
  getPersonaVariables,
  getPromptStageMarks,
  getUndefinedVariables,
  getUsedVariables,
  getVoiceReadiness,
  isRealtimeReady,
  resetInactiveEngineModels,
  toVariableName,
} from "../voice-builder.util";

const READY_PIPELINE = {
  [VOICE_FIELDS.goal]: "Book calls",
  [VOICE_FIELDS.speechToText]: { model: "nova-3" },
  [VOICE_FIELDS.languageModel]: { provider: "openai", model: "gpt-4o" },
  [VOICE_FIELDS.textToSpeech]: { model: "sonic-2" },
  [VOICE_FIELDS.pipelineVoiceConfig]: { voice: "alloy" },
};

const READY_REALTIME_MODEL = {
  provider: "openai",
  model: "gpt-realtime",
  credential_name: "openai-key",
};

const READY_REALTIME = {
  [VOICE_FIELDS.goal]: "Book calls",
  [VOICE_FIELDS.engineMode]: "realtime",
  [VOICE_FIELDS.realtimeModel]: READY_REALTIME_MODEL,
  [VOICE_FIELDS.realtimeVoiceConfig]: { voice: "marin" },
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

  it("marks variables to do for undefined placeholders and ready once each is defined", () => {
    expect(getPromptStageMarks({ [VOICE_FIELDS.goal]: "Help {{name}}" }).variables).toBe("todo");
    expect(
      getPromptStageMarks({
        [VOICE_FIELDS.goal]: "Help {{name}}",
        [VOICE_FIELDS.variables]: { name: "" },
      }).variables,
    ).toBe("ready");
    expect(getPromptStageMarks({ [VOICE_FIELDS.variables]: {} }).variables).toBe("idle");
  });
});

describe("getUsedVariables and getUndefinedVariables", () => {
  const values = {
    [VOICE_FIELDS.goal]: "Help {{ name }} at {{company}}",
    [VOICE_FIELDS.introduction]: "Hi {{name}}",
    [VOICE_FIELDS.variables]: { company: "Acme", unused: "x" },
  };

  it("lists each placeholder once across the prompt fields", () => {
    expect(getUsedVariables(values)).toEqual(["name", "company"]);
  });

  it("lists only the placeholders no variable defines", () => {
    expect(getUndefinedVariables(values)).toEqual(["name"]);
  });
});

describe("getPersonaVariables and getInstructionVariables", () => {
  const values = {
    [VOICE_FIELDS.role]: "Greeter for {{business_name}}",
    [VOICE_FIELDS.goal]: "Book for {{my_name}}",
    [VOICE_FIELDS.instructions]: "Say hi to {{my_name}}",
    [VOICE_FIELDS.introduction]: "Hi {{guest}}",
  };

  it("lists only the placeholders the persona fields use", () => {
    expect(getPersonaVariables(values)).toEqual(["my_name", "business_name"]);
  });

  it("lists only the placeholders the instructions use", () => {
    expect(getInstructionVariables(values)).toEqual(["my_name"]);
  });
});

describe("toVariableName", () => {
  it("keeps the characters the runtime resolves and joins words with underscores", () => {
    expect(toVariableName("{{business name}}")).toBe("business_name");
    expect(toVariableName("caller-id")).toBe("caller_id");
    expect(toVariableName("order.total$")).toBe("order.total");
  });
});

describe("getInactiveEngineModelFields", () => {
  it("targets the engine that is not selected", () => {
    expect(getInactiveEngineModelFields("realtime")).toEqual([
      VOICE_FIELDS.speechToText,
      VOICE_FIELDS.languageModel,
      VOICE_FIELDS.textToSpeech,
    ]);
    expect(getInactiveEngineModelFields("pipeline")).toEqual([VOICE_FIELDS.realtimeModel]);
  });
});

describe("resetInactiveEngineModels", () => {
  const makeForm = (store: Record<string, unknown>) => {
    const setCalls: string[] = [];
    return {
      setCalls,
      store,
      form: {
        getValues: (name: string) => store[name],
        setValue: (name: string, value: unknown) => {
          setCalls.push(name);
          const dot = name.indexOf(".");
          const field = name.slice(0, dot);
          const key = name.slice(dot + 1);
          store[field] = { ...((store[field] as Record<string, unknown>) ?? {}), [key]: value };
        },
      },
    };
  };

  it("clears the pipeline models and keeps voices when realtime is selected", () => {
    const { form, store, setCalls } = makeForm({
      [VOICE_FIELDS.engineMode]: "realtime",
      [VOICE_FIELDS.speechToText]: { provider: "deepgram", model: "nova-3" },
      [VOICE_FIELDS.languageModel]: { provider: "openai", model: "gpt-4o" },
      [VOICE_FIELDS.textToSpeech]: { provider: "cartesia", model: "sonic-2", credential_name: "k" },
      [VOICE_FIELDS.pipelineVoiceConfig]: { voice: "alloy" },
      [VOICE_FIELDS.realtimeModel]: { provider: "openai", model: "gpt-realtime" },
    });
    expect(resetInactiveEngineModels(form)).toBe(true);
    expect(store[VOICE_FIELDS.speechToText]).toMatchObject({ provider: "", model: "" });
    expect(store[VOICE_FIELDS.pipelineVoiceConfig]).toMatchObject({ voice: "alloy" });
    expect(store[VOICE_FIELDS.realtimeModel]).toMatchObject({ model: "gpt-realtime" });
    expect(setCalls.length).toBeGreaterThan(0);
  });

  it("clears the realtime model when pipeline is selected", () => {
    const { form, store } = makeForm({
      [VOICE_FIELDS.engineMode]: "pipeline",
      [VOICE_FIELDS.realtimeModel]: { provider: "openai", model: "gpt-realtime" },
    });
    expect(resetInactiveEngineModels(form)).toBe(true);
    expect(store[VOICE_FIELDS.realtimeModel]).toMatchObject({ provider: "", model: "" });
  });

  it("leaves an already empty engine untouched", () => {
    const { form, setCalls } = makeForm({ [VOICE_FIELDS.engineMode]: "pipeline" });
    expect(resetInactiveEngineModels(form)).toBe(false);
    expect(setCalls).toEqual([]);
  });

  it("does nothing when the engine mode is unknown", () => {
    const { form, setCalls } = makeForm({
      [VOICE_FIELDS.realtimeModel]: { provider: "openai", model: "gpt-realtime" },
    });
    expect(resetInactiveEngineModels(form)).toBe(false);
    expect(setCalls).toEqual([]);
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
      getVoiceReadiness({ ...READY_PIPELINE, [VOICE_FIELDS.pipelineVoiceConfig]: {} })[1],
    ).toMatchObject({
      isReady: false,
      hint: "Pick speech-to-text and text-to-speech models, and a voice.",
    });
  });

  it("judges a realtime agent by its realtime model and voice", () => {
    expect(getVoiceReadiness(READY_REALTIME)[1]).toMatchObject({
      section: "engine",
      isReady: true,
    });
    expect(
      getVoiceReadiness({
        ...READY_REALTIME,
        [VOICE_FIELDS.realtimeVoiceConfig]: { voice: "" },
      })[1],
    ).toMatchObject({
      isReady: false,
      hint: "Pick a realtime provider, a model, the credential it uses, and a voice.",
    });
  });

  it("keeps the engine voice checks independent", () => {
    expect(
      getVoiceReadiness({ ...READY_PIPELINE, [VOICE_FIELDS.realtimeVoiceConfig]: {} })[1].isReady,
    ).toBe(true);
    expect(
      getVoiceReadiness({ ...READY_REALTIME, [VOICE_FIELDS.pipelineVoiceConfig]: {} })[1].isReady,
    ).toBe(true);
  });

  it("requires an introduction when the agent speaks first", () => {
    expect(
      getVoiceReadiness({ ...READY_PIPELINE, [VOICE_FIELDS.firstSpeaker]: "ai" })[0],
    ).toMatchObject({ isReady: false, hint: "Write what the agent says first." });
  });
});

describe("isRealtimeReady", () => {
  it("requires a provider, a model, a credential name, and a voice", () => {
    expect(isRealtimeReady(READY_REALTIME)).toBe(true);
    expect(
      isRealtimeReady({
        ...READY_REALTIME,
        [VOICE_FIELDS.realtimeModel]: { ...READY_REALTIME_MODEL, credential_name: " " },
      }),
    ).toBe(false);
    expect(
      isRealtimeReady({
        ...READY_REALTIME,
        [VOICE_FIELDS.realtimeModel]: { ...READY_REALTIME_MODEL, model: "" },
      }),
    ).toBe(false);
    expect(
      isRealtimeReady({
        ...READY_REALTIME,
        [VOICE_FIELDS.realtimeVoiceConfig]: { voice: " " },
      }),
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
