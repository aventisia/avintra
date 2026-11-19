import { describe, expect, it } from "vitest";

import { getVoiceClearedNote } from "../voice-reset-note.util";

describe("getVoiceClearedNote", () => {
  it("names both values a provider change cleared", () => {
    expect(
      getVoiceClearedNote({
        providerChanged: true,
        languageChanged: false,
        language: "en-US",
        voice: "alloy",
      }),
    ).toBe("The language and voice were cleared because the provider changed.");
  });

  it("names only the value a provider change actually cleared", () => {
    expect(
      getVoiceClearedNote({ providerChanged: true, languageChanged: false, voice: "alloy" }),
    ).toBe("The voice was cleared because the provider changed.");
    expect(
      getVoiceClearedNote({ providerChanged: true, languageChanged: false, language: "en-US" }),
    ).toBe("The language was cleared because the provider changed.");
  });

  it("stays silent when the change cleared nothing", () => {
    expect(getVoiceClearedNote({ providerChanged: true, languageChanged: false })).toBeNull();
    expect(getVoiceClearedNote({ providerChanged: false, languageChanged: true })).toBeNull();
  });

  it("names the voice a language change cleared", () => {
    expect(
      getVoiceClearedNote({ providerChanged: false, languageChanged: true, voice: "alloy" }),
    ).toBe("The voice was cleared because the language changed.");
  });
});
