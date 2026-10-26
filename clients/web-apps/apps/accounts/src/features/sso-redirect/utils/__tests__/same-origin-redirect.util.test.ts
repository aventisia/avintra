import { describe, expect, it } from "vitest";

import { getSameOriginRedirectPath } from "../same-origin-redirect.util";

const ORIGIN = "https://app.example.com";

describe("getSameOriginRedirectPath", () => {
  it("keeps a plain in-app path", () => {
    expect(getSameOriginRedirectPath("/workspace/jobs", ORIGIN)).toBe("/workspace/jobs");
  });

  it("keeps a path with query and hash", () => {
    expect(getSameOriginRedirectPath("/workspace/jobs?tab=1#top", ORIGIN)).toBe(
      "/workspace/jobs?tab=1#top",
    );
  });

  it("keeps a percent-encoded path", () => {
    expect(getSameOriginRedirectPath("%2Fworkspace%2Fjobs", ORIGIN)).toBe("/workspace/jobs");
  });

  it("rejects a missing redirect", () => {
    expect(getSameOriginRedirectPath(null, ORIGIN)).toBeNull();
    expect(getSameOriginRedirectPath("", ORIGIN)).toBeNull();
  });

  it("rejects control characters", () => {
    expect(getSameOriginRedirectPath("/\u0000evil", ORIGIN)).toBeNull();
    expect(getSameOriginRedirectPath("/\u001fevil", ORIGIN)).toBeNull();
    expect(getSameOriginRedirectPath("/\u007fevil", ORIGIN)).toBeNull();
    expect(getSameOriginRedirectPath("/work\u000dspace", ORIGIN)).toBeNull();
  });

  it("rejects protocol-relative and backslash paths", () => {
    expect(getSameOriginRedirectPath("//evil.example.com", ORIGIN)).toBeNull();
    expect(getSameOriginRedirectPath("/\\evil.example.com", ORIGIN)).toBeNull();
    expect(getSameOriginRedirectPath("%2F%2Fevil.example.com", ORIGIN)).toBeNull();
  });

  it("rejects absolute URLs", () => {
    expect(getSameOriginRedirectPath("https://evil.example.com/path", ORIGIN)).toBeNull();
    expect(getSameOriginRedirectPath("javascript:alert(1)", ORIGIN)).toBeNull();
    expect(getSameOriginRedirectPath("workspace/jobs", ORIGIN)).toBeNull();
  });

  it("rejects a redirect that does not decode", () => {
    expect(getSameOriginRedirectPath("/%E0%A4%A", ORIGIN)).toBeNull();
  });
});
