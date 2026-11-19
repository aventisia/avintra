import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { describe, expect, it, vi } from "vitest";

import type { LoadFlowDto } from "@/features/01-build/flow-builder";

import { buildFlowExportPayload } from "../flow-export.util";

// IMPORTANT NOTE: the app modules under test read `window` at import time; this suite runs in the
// default Node environment, so alias `window` to the global object before the imports evaluate.
vi.hoisted(() => {
  if (!("window" in globalThis)) {
    Object.defineProperty(globalThis, "window", { value: globalThis });
  }
});

const loadFlow = (overrides: Record<string, unknown> = {}): LoadFlowDto =>
  ({
    id: "flow-1",
    versionId: "version-1",
    versionNumber: 1,
    name: "Invoice bot",
    type: FlowTypesEnum.Agent,
    description: "Handles invoices",
    reactFlowObject: JSON.stringify({ nodes: [], edges: [], viewport: {} }),
    flowVariablesObject: "[]",
    inputOutputObject: "[]",
    isLocked: false,
    isDraft: true,
    isPublished: false,
    isArchived: false,
    ...overrides,
  }) as LoadFlowDto;

const chatCanvas = {
  nodes: [
    {
      id: "chat",
      type: "aiNode",
      data: {
        name: "CreateConversationAIAgent",
        inputs: [
          {
            key: "__RecommendedActionsConfig__Conversation",
            value: { defaultActions: ["Track order", "Talk to support"] },
          },
        ],
      },
    },
  ],
  edges: [],
  viewport: {},
};

const voiceCanvas = {
  nodes: [
    {
      id: "voice",
      type: "aiNode",
      data: {
        name: "CreateVoiceAIAgent",
        inputs: [
          { key: "__FirstSpeaker__Voice", value: "ai" },
          { key: "__Introduction__Voice", value: "Hello" },
        ],
      },
    },
  ],
  edges: [],
  viewport: {},
};

describe("buildFlowExportPayload", () => {
  it("derives Chat defaultActions from the canvas like the Studio Export", () => {
    const payload = buildFlowExportPayload(
      loadFlow({ type: FlowTypesEnum.ChatAgent, reactFlowObject: JSON.stringify(chatCanvas) }),
    );

    expect(payload.reactFlowObject.defaultActions).toEqual(["Track order", "Talk to support"]);
    expect(payload.agent).toMatchObject({ name: "Invoice bot", type: FlowTypesEnum.ChatAgent });
  });

  it("derives Voice carry keys from the canvas like the Studio Export", () => {
    const payload = buildFlowExportPayload(
      loadFlow({ type: FlowTypesEnum.VoiceAgent, reactFlowObject: JSON.stringify(voiceCanvas) }),
    );

    expect(payload.reactFlowObject).toMatchObject({
      firstSpeaker: "ai",
      voiceIntroduction: "Hello",
    });
  });

  it("writes no carry keys for a generic agent", () => {
    const payload = buildFlowExportPayload(loadFlow());

    expect(payload.reactFlowObject).not.toHaveProperty("defaultActions");
    expect(payload.reactFlowObject).not.toHaveProperty("firstSpeaker");
  });
});
