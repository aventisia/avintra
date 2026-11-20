import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { describe, expect, it, vi } from "vitest";

import { parseFlowImportContent } from "../flow-import.util";

// IMPORTANT NOTE: the app modules under test read `window` at import time; this suite runs in the
// default Node environment, so alias `window` to the global object before the imports evaluate.
vi.hoisted(() => {
  if (!("window" in globalThis)) {
    Object.defineProperty(globalThis, "window", { value: globalThis });
  }
});

const CHAT_NODE = { id: "chat", type: "aiNode", data: { name: "CreateConversationAIAgent" } };
const VOICE_NODE = { id: "voice", type: "aiNode", data: { name: "CreateVoiceAIAgent" } };

const canvas = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  nodes: [{ id: "start", type: "triggerNode" }],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  flowVariablesObject: [],
  inputOutputObject: [],
  ...overrides,
});

const envelopeFile = ({
  agent = { name: "Invoice bot", type: "Agent", description: "Handles invoices" },
  reactFlowObject = canvas(),
}) => JSON.stringify({ agent, reactFlowObject });

describe("parseFlowImportContent", () => {
  it("accepts a new-format file and keeps its metadata", () => {
    const payload = parseFlowImportContent(
      envelopeFile({
        agent: { name: "Invoice bot", type: "Block", description: "Reusable block" },
        reactFlowObject: canvas({ supportedPlatform: "windows" }),
      }),
      "anything.json",
    );

    expect(payload).toMatchObject({
      name: "Invoice bot",
      type: FlowTypesEnum.Block,
      description: "Reusable block",
      supportedPlatform: "windows",
    });
  });

  it("keeps the file type exactly even when the canvas looks generic", () => {
    const payload = parseFlowImportContent(
      envelopeFile({
        agent: { name: "Chat bot", type: "ChatAgent", description: "" },
        reactFlowObject: canvas(),
      }),
      "chat.json",
    );

    expect(payload.type).toBe(FlowTypesEnum.ChatAgent);
  });

  it("derives name, type and blank description from an old canvas-only file", () => {
    const payload = parseFlowImportContent(
      JSON.stringify({ reactFlowObject: canvas({ nodes: [CHAT_NODE], flowVariablesObject: [] }) }),
      "My chat agent.json",
    );

    expect(payload).toMatchObject({
      name: "My chat agent",
      type: FlowTypesEnum.ChatAgent,
      description: "",
    });
    expect(payload.supportedPlatform).toBeUndefined();
  });

  it("derives VoiceAgent and Agent from old graph shapes", () => {
    const voice = parseFlowImportContent(
      JSON.stringify({ reactFlowObject: canvas({ nodes: [VOICE_NODE] }) }),
      "voice agent.json",
    );
    const generic = parseFlowImportContent(
      JSON.stringify({ reactFlowObject: canvas() }),
      "automation.json",
    );

    expect(voice.type).toBe(FlowTypesEnum.VoiceAgent);
    expect(generic.type).toBe(FlowTypesEnum.Agent);
  });

  it("accepts a version-history canvas-only file with variables beside the canvas", () => {
    const payload = parseFlowImportContent(
      JSON.stringify({
        reactFlowObject: { nodes: [], edges: [], viewport: {} },
        flowVariablesObject: [{ nodeId: "start", outputs: ["Result"] }],
      }),
      "History_v4.json",
    );

    expect(payload.flowVariablesObject).toEqual([{ nodeId: "start", outputs: ["Result"] }]);
    expect(payload.name).toBe("History_v4");
  });

  it("accepts an empty canvas", () => {
    const payload = parseFlowImportContent(
      envelopeFile({
        agent: { name: "Empty agent", type: "Agent", description: "" },
        reactFlowObject: { nodes: [], edges: [], viewport: {} },
      }),
      "empty.json",
    );

    expect(payload.canvas.nodes).toEqual([]);
  });

  it("rejects a non-JSON file content", () => {
    expect(() => parseFlowImportContent("not json", "bad.json")).toThrow(
      "Error parsing file content",
    );
  });

  it("rejects a file without a canvas", () => {
    expect(() =>
      parseFlowImportContent('{"agent":{"name":"A","type":"Agent"}}', "bad.json"),
    ).toThrow("Please upload valid data");
  });

  it("rejects a non-list flow variables object", () => {
    expect(() =>
      parseFlowImportContent(
        JSON.stringify({ reactFlowObject: canvas({ flowVariablesObject: {} }) }),
        "bad.json",
      ),
    ).toThrow("Invalid flow variables object (must be an array)");
  });

  it("rejects a non-list input/output object", () => {
    expect(() =>
      parseFlowImportContent(
        JSON.stringify({ reactFlowObject: canvas({ inputOutputObject: {} }) }),
        "bad.json",
      ),
    ).toThrow("Invalid input/output object (must be an array)");
  });

  it("rejects an unknown agent type", () => {
    expect(() =>
      parseFlowImportContent(
        envelopeFile({ agent: { name: "A", type: "chat", description: "" } }),
        "bad.json",
      ),
    ).toThrow("Unknown agent type");
  });

  it("rejects a name that breaks the create rules", () => {
    expect(() =>
      parseFlowImportContent(
        envelopeFile({ agent: { name: "Bad/name", type: "Agent", description: "" } }),
        "bad.json",
      ),
    ).toThrow("Agent name can only contain");
  });

  it("rejects names over 255 characters", () => {
    expect(() =>
      parseFlowImportContent(
        envelopeFile({ agent: { name: "a".repeat(256), type: "Agent", description: "" } }),
        "bad.json",
      ),
    ).toThrow("Agent name must not exceed 255 characters");
  });

  it("rejects descriptions over 500 characters", () => {
    expect(() =>
      parseFlowImportContent(
        envelopeFile({ agent: { name: "A", type: "Agent", description: "a".repeat(501) } }),
        "bad.json",
      ),
    ).toThrow("Agent description must not exceed 500 characters");
  });

  it("rejects an unknown platform", () => {
    expect(() =>
      parseFlowImportContent(
        envelopeFile({ reactFlowObject: canvas({ supportedPlatform: "linux" }) }),
        "bad.json",
      ),
    ).toThrow("Unknown supported platform");
  });

  it("rejects a derived name that breaks the create rules", () => {
    expect(() =>
      parseFlowImportContent(JSON.stringify({ reactFlowObject: canvas() }), "Bad/name.json"),
    ).toThrow("Agent name can only contain");
    expect(() =>
      parseFlowImportContent(
        JSON.stringify({ reactFlowObject: canvas() }),
        `${"a".repeat(256)}.json`,
      ),
    ).toThrow("Agent name must not exceed 255 characters");
  });

  it("rejects malformed flow variable entries", () => {
    expect(() =>
      parseFlowImportContent(
        JSON.stringify({ reactFlowObject: canvas({ flowVariablesObject: [{ foo: 1 }] }) }),
        "bad.json",
      ),
    ).toThrow("entries must have a nodeId and outputs");
  });

  it("rejects a conditional node with a missing merge id", () => {
    expect(() =>
      parseFlowImportContent(
        JSON.stringify({
          reactFlowObject: canvas({ nodes: [{ id: "cond", type: "conditionalNode", data: {} }] }),
        }),
        "bad.json",
      ),
    ).toThrow("missing merge node id");
  });
});
