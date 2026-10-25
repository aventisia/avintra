import { describe, expect, it } from "vitest";

import { toTableCNCsvText } from "../utils/table-cn-export.util";

describe("toTableCNCsvText", () => {
  it("writes a header row and data rows separated by CRLF", () => {
    expect(
      toTableCNCsvText(
        ["Name", "Type"],
        [
          ["Invoice bot", "Agent"],
          ["Helpdesk", "ChatAgent"],
        ],
      ),
    ).toBe("Name,Type\r\nInvoice bot,Agent\r\nHelpdesk,ChatAgent");
  });

  it("quotes cells with commas, quotes, or line breaks", () => {
    expect(toTableCNCsvText(["Note"], [["a,b"], ['say "hi"'], ["two\nlines"]])).toBe(
      'Note\r\n"a,b"\r\n"say ""hi"""\r\n"two\nlines"',
    );
  });

  it("joins arrays and writes empty cells for missing values", () => {
    const createdOn = new Date(Date.UTC(2026, 9, 23));

    expect(
      toTableCNCsvText(["Models", "Owner", "Created"], [[["gpt", "claude"], null, createdOn]]),
    ).toBe("Models,Owner,Created\r\ngpt; claude,,2026-10-23T00:00:00.000Z");
  });

  it("prefixes text that a spreadsheet would run as a formula, but not numbers", () => {
    expect(
      toTableCNCsvText(
        ["Name", "Count"],
        [
          ['=HYPERLINK("x")', -5],
          ["@SUM(A1)", 3],
          ["-cmd", 0],
        ],
      ),
    ).toBe('Name,Count\r\n"\'=HYPERLINK(""x"")",-5\r\n\'@SUM(A1),3\r\n\'-cmd,0');
  });
});
