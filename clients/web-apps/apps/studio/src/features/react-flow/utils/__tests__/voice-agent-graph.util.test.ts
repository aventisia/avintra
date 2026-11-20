import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import { VOICE_AGENT_NODE_NAME, normalizeVoiceAgentGraph } from "../voice-agent-graph.util";

const SHARED_KEY = "__VoiceConfig__TextToSpeech";
const PIPELINE_KEY = "__VoiceConfig__PipelineVoice";
const REALTIME_KEY = "__VoiceConfig__RealtimeVoice";

type SavedInput = { key: string; value: unknown };

const createVoiceNode = (inputs: SavedInput[]): Node => ({
  id: "voice-1",
  type: "aiNode",
  position: { x: 0, y: 0 },
  data: { name: VOICE_AGENT_NODE_NAME, inputs },
});

const createModelNode = (): Node => ({
  id: "model-1",
  type: "modelNode",
  position: { x: 0, y: 0 },
  data: { label: "" },
});

const createModelEdge = (): Edge => ({
  id: "edge-1",
  source: "model-1",
  target: "voice-1",
});

const readValue = (node: Node, key: string) =>
  (node.data.inputs as SavedInput[]).find((input) => input.key === key)?.value;

const normalize = (inputs: SavedInput[]) =>
  normalizeVoiceAgentGraph([createVoiceNode(inputs), createModelNode()], [createModelEdge()])
    .nodes[0];

describe("normalizeVoiceAgentGraph voice config migration", () => {
  it("seeds both engines from the shared setting without sharing its object", () => {
    const voiceNode = normalize([
      { key: SHARED_KEY, value: { language: "en-US", voice: "alloy", speed: 1.2 } },
    ]);
    const pipeline = readValue(voiceNode, PIPELINE_KEY);
    const realtime = readValue(voiceNode, REALTIME_KEY);

    expect(pipeline).toEqual({ language: "en-US", voice: "alloy", speed: 1.2 });
    expect(realtime).toEqual(pipeline);
    expect(pipeline).not.toBe(realtime);
  });

  it("keeps an engine's saved choice over the shared setting", () => {
    const voiceNode = normalize([
      { key: SHARED_KEY, value: { language: "en", voice: "alloy", speed: 1 } },
      { key: REALTIME_KEY, value: { language: "en", voice: "marin", speed: 1 } },
    ]);

    expect(readValue(voiceNode, REALTIME_KEY)).toEqual({
      language: "en",
      voice: "marin",
      speed: 1,
    });
    expect(readValue(voiceNode, PIPELINE_KEY)).toEqual({
      language: "en",
      voice: "alloy",
      speed: 1,
    });
  });

  it("keeps the defaults when the shared setting is empty", () => {
    const voiceNode = normalize([{ key: SHARED_KEY, value: {} }]);

    expect(readValue(voiceNode, PIPELINE_KEY)).toEqual({ language: "en", voice: "", speed: 1 });
    expect(readValue(voiceNode, REALTIME_KEY)).toEqual({ language: "en", voice: "", speed: 1 });
  });
});
