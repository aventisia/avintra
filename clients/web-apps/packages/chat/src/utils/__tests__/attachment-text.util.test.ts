import { type ChatModelAdapter, type ThreadMessage } from "@assistant-ui/react";
import { describe, expect, it, vi } from "vitest";

import { splitAttachmentText, withAttachmentText } from "../attachment-text.util";

const block = '<attachment name="a &quot;b&quot;.md">\nline 1\nline 2\n</attachment>';

describe("withAttachmentText", () => {
  it("appends text attachments to their user message and leaves other parts alone", async () => {
    const run = vi.fn<ChatModelAdapter["run"]>(async () => ({ content: [] }));
    const user = {
      role: "user",
      content: [{ type: "text", text: "Summarize" }],
      attachments: [
        { content: [{ type: "text", text: block }] },
        { content: [{ type: "image", image: "data:image/png;base64,AA" }] },
      ],
    } as unknown as ThreadMessage;
    const assistant = { role: "assistant", content: [] } as unknown as ThreadMessage;

    await withAttachmentText({ run }).run({
      messages: [user, assistant],
    } as unknown as Parameters<ChatModelAdapter["run"]>[0]);

    const [sentUser, sentAssistant] = run.mock.calls[0]![0].messages;
    expect(sentUser!.content).toEqual([
      { type: "text", text: "Summarize" },
      { type: "text", text: block },
    ]);
    expect(sentAssistant).toBe(assistant);
  });
});

describe("splitAttachmentText", () => {
  it("restores inlined attachments as documents and strips them from the text", () => {
    const { text, attachments } = splitAttachmentText(`Summarize\n${block}`, "m1");

    expect(text).toBe("Summarize");
    expect(attachments).toEqual([
      {
        id: "m1-attachment-0",
        type: "document",
        name: 'a "b".md',
        contentType: "text/plain",
        status: { type: "complete" },
        content: [{ type: "text", text: block }],
      },
    ]);
  });

  it("leaves plain text untouched", () => {
    expect(splitAttachmentText("Just a question", "m1")).toEqual({
      text: "Just a question",
      attachments: [],
    });
  });
});
