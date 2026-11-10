import { describe, expect, it, vi } from "vitest";

import { describeActivity } from "../activity-label.util";

// The package barrel reaches `window` through its API client, which node tests don't have.
vi.mock("@avplatform/assistant-chat", () => ({ humanizeToolLabel: (name: string) => `[${name}]` }));

const reasoning = { type: "reasoning" };
const runningTool = { type: "tool-call", toolName: "gmail_search_messages" };
const doneTool = { ...runningTool, result: "3 messages" };
const failedTool = { type: "tool-call", toolName: "slack_post", result: "403", isError: true };

describe("describeActivity", () => {
  it("names the tool that is running", () => {
    expect(describeActivity([reasoning, runningTool], true)).toBe("[gmail_search_messages]");
  });

  it("says Thinking between steps", () => {
    expect(describeActivity([reasoning], true)).toBe("Thinking");
    expect(describeActivity([doneTool], true)).toBe("Thinking");
  });

  it("tallies tools and failures once finished", () => {
    expect(describeActivity([reasoning, doneTool], false)).toBe("Used 1 tool");
    expect(describeActivity([doneTool, failedTool], false)).toBe("Used 2 tools, 1 failed");
    expect(describeActivity([reasoning], false)).toBe("Thought process");
  });
});
