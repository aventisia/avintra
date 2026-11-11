import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

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

  it("inlines each sheet of a workbook as CSV", async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["fruit", "price"],
        ["apple", 2],
      ]),
      "Prices",
    );
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([]), "Empty");
    const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    const { adapter, pending } = await add(new File([bytes], "prices.xlsx"));

    const sent = await adapter.send(pending);
    expect(sent.content).toEqual([
      {
        type: "text",
        text: '<attachment name="prices.xlsx">\nSheet: Prices\nfruit,price\napple,2\n</attachment>',
      },
    ]);
  });

  it("inlines the paragraphs of a Word document", async () => {
    const zip = XLSX.CFB.utils.cfb_new();
    XLSX.CFB.utils.cfb_add(
      zip,
      "/word/document.xml",
      new TextEncoder().encode(
        '<w:document><w:body><w:p><w:r><w:t>Q1 &amp; Q2</w:t></w:r><w:r><w:tab/><w:t xml:space="preserve"> plan</w:t></w:r></w:p><w:p><w:r><w:t>Next</w:t></w:r></w:p></w:body></w:document>',
      ),
    );
    const bytes = XLSX.CFB.write(zip, { type: "array", fileType: "zip" }) as number[];
    const { adapter, pending } = await add(new File([new Uint8Array(bytes)], "plan.docx"));

    const sent = await adapter.send(pending);
    expect(sent.content).toEqual([
      { type: "text", text: '<attachment name="plan.docx">\nQ1 & Q2\t plan\nNext\n</attachment>' },
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
