// The package entry pulls in the UI package, which needs a browser.
import { buildContentPartsFromFrames } from "@avplatform/assistant-chat/content-parts";
import { describe, expect, it } from "vitest";

import { NAVIGATE_TOOL_NAME } from "../chat-intent.util";

describe("stream frames → parts", () => {
  it("keeps reasoning, skill, navigate call and text in order", () => {
    const parts = buildContentPartsFromFrames([
      { type: "reasoning", output: "Looking " },
      { type: "reasoning", output: "for the page" },
      { type: "skill", output: { name: "navigation" } },
      {
        type: "tool_call",
        output: { tool_call_id: "nav-1", name: NAVIGATE_TOOL_NAME, args: { route: "/agents" } },
      },
      { type: "tool_call", output: { tool_call_id: "nav-1", content: "ok" } },
      { type: "delta", output: "Here " },
      { type: "delta", output: "it is." },
      { type: "done", output: "Here it is." },
    ]);

    expect(parts).toEqual([
      { type: "reasoning", text: "Looking for the page" },
      { type: "data", name: "skill", data: { name: "navigation" } },
      expect.objectContaining({
        type: "tool-call",
        toolCallId: "nav-1",
        toolName: NAVIGATE_TOOL_NAME,
        args: { route: "/agents" },
        result: "ok",
      }),
      { type: "text", text: "Here it is." },
    ]);
  });

  it("expires an approval nobody decided and shows stream errors as text", () => {
    const parts = buildContentPartsFromFrames([
      { type: "approval_required", output: { tool_call_id: "a-1", name: "send_email", args: {} } },
      { type: "error", message: "Model unavailable" },
    ]);

    expect(parts[0]).toMatchObject({ approval: { id: "a-1", resolution: "expired" } });
    expect(parts[1]).toEqual({ type: "text", text: "Model unavailable" });
  });

  it("uses the done text when no deltas streamed", () => {
    expect(buildContentPartsFromFrames([{ type: "done", output: "Hi" }])).toEqual([
      { type: "text", text: "Hi" },
    ]);
  });
});
