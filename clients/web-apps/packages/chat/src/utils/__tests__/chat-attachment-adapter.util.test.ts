import { describe, expect, it } from "vitest";

import { createChatAttachmentAdapter } from "../chat-attachment-adapter.util";

const add = async (file: File) => {
  const adapter = createChatAttachmentAdapter();
  const pending = await adapter.add({ file });
  if (Symbol.asyncIterator in pending) throw new Error("expected a single attachment");
  return { adapter, pending };
};

describe("createChatAttachmentAdapter", () => {
  it("sends a PDF to the model as a file part", async () => {
    const file = new File(["%PDF-1.4"], "report.pdf", { type: "application/pdf" });
    const { adapter, pending } = await add(file);

    expect(pending.type).toBe("document");
    const sent = await adapter.send(pending);
    expect(sent.content).toEqual([
      {
        type: "file",
        data: `data:application/pdf;base64,${btoa("%PDF-1.4")}`,
        mimeType: "application/pdf",
        filename: "report.pdf",
      },
    ]);
  });

  it("inlines a text file without a mime type, matched by extension", async () => {
    const { adapter, pending } = await add(new File(["# Notes"], "notes.md"));

    const sent = await adapter.send(pending);
    expect(sent.content).toEqual([
      { type: "text", text: '<attachment name="notes.md">\n# Notes\n</attachment>' },
    ]);
  });

  it("keeps images as image attachments", async () => {
    const { pending } = await add(new File(["png"], "shot.png", { type: "image/png" }));
    expect(pending.type).toBe("image");
  });

  it("rejects files over 10 MB", () => {
    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "huge.png", {
      type: "image/png",
    });
    expect(() => createChatAttachmentAdapter().add({ file })).toThrow(
      "huge.png is larger than 10 MB",
    );
  });
});
