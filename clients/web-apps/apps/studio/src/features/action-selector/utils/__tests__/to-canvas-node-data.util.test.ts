import { describe, expect, it } from "vitest";

import { useNodeSelectorStore } from "../../stores/action-selector-store";
import { toCanvasNodeData } from "../to-canvas-node-data.util";

useNodeSelectorStore.getState().setActionSelectorData([
  {
    label: "L1",
    description: "L1",
    actionCategories: [
      {
        label: "L2",
        description: "L2",
        actions: [
          {
            type: "activityNode",
            name: "SendEmail",
            label: "Send email",
            description: "Sends an email to the customer",
          },
          {
            type: "aiNode",
            name: "CreateConversationAIAgent",
            label: "Chat AI",
            description: "Chat AI",
          },
        ],
      },
    ],
  },
]);

const entry = {
  type: "activityNode" as const,
  name: "SendEmail",
  label: "Send email",
  description: "Sends an email to the customer",
  docsLink: "https://docs.aventisia.com",
  icon: "MailIcon",
};

describe("toCanvasNodeData", () => {
  it("drops the subtitle and docs link and keeps every other key", () => {
    expect(toCanvasNodeData(entry)).toEqual({
      type: "activityNode",
      name: "SendEmail",
      label: "Send email",
      icon: "MailIcon",
    });
  });

  it("accepts an entry without a docs link", () => {
    const withoutDocsLink = {
      type: "activityNode" as const,
      name: "SendEmail",
      label: "Send email",
      description: "Sends an email to the customer",
    };

    expect(toCanvasNodeData(withoutDocsLink)).not.toHaveProperty("description");
    expect(toCanvasNodeData(withoutDocsLink)).not.toHaveProperty("docsLink");
  });

  it("drops stale keys still saved on a pre-change flow", () => {
    const saved = {
      type: "aiNode" as const,
      name: "CreateConversationAIAgent",
      label: "Chat AI",
      description: "Saved subtitle",
      docsLink: "https://docs.aventisia.com",
      inputs: [{ key: "__Prompt__Conversation", value: "Hi" }],
    };

    expect(toCanvasNodeData(saved)).toEqual({
      type: "aiNode",
      name: "CreateConversationAIAgent",
      label: "Chat AI",
      inputs: [{ key: "__Prompt__Conversation", value: "Hi" }],
    });
  });

  it("leaves canvas data without the stale keys unchanged", () => {
    const canvasData = { type: "modelNode" as const, name: "Model", label: "openai" };

    expect(toCanvasNodeData(canvasData)).toEqual(canvasData);
  });

  it("keeps the hardcoded text of nodes outside the action catalog", () => {
    const trigger = {
      type: "triggerNode" as const,
      name: "manualTrigger",
      label: "Manual trigger",
      description: "Start your flow clicking the execute button",
    };
    const customTool = {
      type: "cloudConnectorNode" as const,
      name: "CustomTool/Pets.getPet",
      label: "Get pet",
      description: "GET /pet",
    };

    expect(toCanvasNodeData(trigger)).toEqual(trigger);
    expect(toCanvasNodeData(customTool)).toEqual(customTool);
  });
});
