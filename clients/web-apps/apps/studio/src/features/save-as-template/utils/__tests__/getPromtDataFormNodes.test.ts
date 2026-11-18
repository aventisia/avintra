import { Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import { NodeDataType } from "@/types/node-data-type";

import { getPromptDataFromNodes } from "../getPromtDataFormNodes";

const node = (data: Record<string, unknown>): Node<NodeDataType> =>
  ({ id: data.name as string, type: data.type, data }) as unknown as Node<NodeDataType>;

describe("getPromptDataFromNodes", () => {
  it("resolves the subtitle from the action catalog by node name", () => {
    const nodes = [node({ type: "activityNode", name: "SendEmail", label: "Send email" })];

    expect(getPromptDataFromNodes(nodes, new Map([["SendEmail", "Sends an email"]]))).toEqual([
      { label: "Send email", description: "Sends an email" },
    ]);
  });

  it("omits the subtitle when the action is not in the catalog", () => {
    const nodes = [node({ type: "activityNode", name: "Renamed", label: "Send email" })];

    expect(getPromptDataFromNodes(nodes, new Map([["SendEmail", "Sends an email"]]))).toEqual([
      { label: "Send email" },
    ]);
  });

  it("omits a blank catalog subtitle", () => {
    const nodes = [node({ type: "activityNode", name: "SendEmail", label: "Send email" })];

    expect(getPromptDataFromNodes(nodes, new Map([["SendEmail", "   "]]))).toEqual([
      { label: "Send email" },
    ]);
  });

  it("falls back to the node's own text outside the catalog", () => {
    const nodes = [
      node({
        type: "cloudConnectorNode",
        name: "CustomTool/Pets.getPet",
        label: "Get pet",
        description: "GET /pet",
      }),
    ];

    expect(getPromptDataFromNodes(nodes, new Map())).toEqual([
      { label: "Get pet", description: "GET /pet" },
    ]);
  });

  it("prefers the catalog subtitle over stale node text", () => {
    const nodes = [
      node({
        type: "activityNode",
        name: "SendEmail",
        label: "Send email",
        description: "Stale saved text",
      }),
    ];

    expect(getPromptDataFromNodes(nodes, new Map([["SendEmail", "Sends an email"]]))).toEqual([
      { label: "Send email", description: "Sends an email" },
    ]);
  });

  it("never emits a docs link", () => {
    const nodes = [
      node({
        type: "activityNode",
        name: "SendEmail",
        label: "Send email",
        docsLink: "https://docs.aventisia.com",
      }),
    ];

    const [prompt] = getPromptDataFromNodes(nodes, new Map([["SendEmail", "Sends an email"]]));

    expect(prompt).not.toHaveProperty("docsLink");
  });

  it("keeps an AI node's own text even when the catalog differs", () => {
    const nodes = [
      node({
        type: "aiNode",
        name: "CreateVoiceAIAgent",
        label: "Voice AI",
        description: "Handles voice conversations",
      }),
    ];

    expect(
      getPromptDataFromNodes(nodes, new Map([["CreateVoiceAIAgent", "Generic AI text"]])),
    ).toEqual([{ label: "Voice AI", description: "Handles voice conversations" }]);
  });

  it("falls back to the catalog for an AI node without its own text", () => {
    const nodes = [node({ type: "aiNode", name: "CreateVoiceAIAgent", label: "Voice AI" })];

    expect(
      getPromptDataFromNodes(nodes, new Map([["CreateVoiceAIAgent", "Generic AI text"]])),
    ).toEqual([{ label: "Voice AI", description: "Generic AI text" }]);
  });
});
