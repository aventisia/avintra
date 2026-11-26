import { describe, expect, it } from "vitest";

import { checkProjectFile, readProjectFileText } from "../project-file.util";

const existing = (count: number, sizeBytes = 100) =>
  Array.from({ length: count }, () => ({ sizeBytes }));

describe("checkProjectFile", () => {
  it("accepts a small text file with room left", () => {
    expect(checkProjectFile({ name: "notes.md", size: 10240 }, existing(2))).toBeNull();
  });

  it("refuses a file type that is not text", () => {
    expect(checkProjectFile({ name: "data.exe", size: 10 }, [])).toMatch(/txt/);
  });

  it("refuses a file name over 200 characters", () => {
    expect(checkProjectFile({ name: `${"a".repeat(197)}.txt`, size: 10 }, [])).toMatch(/too long/);
  });

  it("refuses an empty file", () => {
    expect(checkProjectFile({ name: "notes.txt", size: 0 }, [])).toMatch(/empty/);
  });

  it("refuses a file over 50 KB", () => {
    expect(checkProjectFile({ name: "big.txt", size: 51201 }, [])).toMatch(/50 KB/);
  });

  it("refuses an 11th file", () => {
    expect(checkProjectFile({ name: "a.txt", size: 1 }, existing(10))).toMatch(/10 files/);
  });

  it("refuses a file that tips the total over 100 KB", () => {
    expect(checkProjectFile({ name: "a.txt", size: 51200 }, existing(1, 51201))).toMatch(/100 KB/);
  });

  it("matches the extension case-insensitively", () => {
    expect(checkProjectFile({ name: "README.MD", size: 10 }, [])).toBeNull();
  });
});

describe("readProjectFileText", () => {
  it("reads UTF-8 text unchanged", async () => {
    expect(await readProjectFileText(new File(["Café"], "menu.csv"))).toBe("Café");
  });

  it("refuses a Windows-1252 file instead of storing replacement characters", async () => {
    const latin1 = new File([new Uint8Array([0x43, 0x61, 0x66, 0xe9])], "menu.csv");
    await expect(readProjectFileText(latin1)).rejects.toThrow("The file is not valid UTF-8 text.");
  });
});
