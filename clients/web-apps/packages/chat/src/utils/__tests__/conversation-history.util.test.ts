import { groupConversationMessages } from "@avplatform/assistant-chat/conversation-messages";
import { describe, expect, it } from "vitest";

import { toChatMarkdown } from "../conversation-history.util";

describe("toChatMarkdown", () => {
  it("writes the title, each message under its speaker and text attachments by name", () => {
    const markdown = toChatMarkdown("Q3 plan", [
      {
        id: "u1",
        role: "User",
        content: 'Summarize this\n\n<attachment name="notes.md">\nline\n</attachment>',
      },
      { id: "a1", role: "Assistant", content: "Here is the **summary**." },
      { id: "s1", role: "System", content: "hidden" },
    ]);

    expect(markdown).toBe(
      "# Q3 plan\n\n## You\n\nSummarize this\n\n_Attached: notes.md_\n\n## Assistant\n\nHere is the **summary**.\n",
    );
  });
});

describe("groupConversationMessages", () => {
  it("restores a stored rating on the reply", () => {
    const [, reply] = groupConversationMessages([
      { id: "u1", role: "User", content: "Hi" },
      { id: "a1", role: "Assistant", content: "Hello", metadata: { feedback: "negative" } },
    ]);

    expect(reply?.metadata).toEqual({ submittedFeedback: { type: "negative" } });
  });
});
