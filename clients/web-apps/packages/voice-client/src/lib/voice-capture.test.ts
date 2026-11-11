import { describe, expect, it } from "vitest";

import { captureOptionsFor } from "./voice-capture.util";

describe("captureOptionsFor", () => {
  it("turns browser processing on for auto", () => {
    expect(captureOptionsFor("auto")).toEqual({
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true,
    });
  });

  it("turns browser processing off for every other mode", () => {
    for (const mode of ["none", "standard", "telephony"] as const) {
      expect(captureOptionsFor(mode)).toEqual({
        noiseSuppression: false,
        echoCancellation: false,
        autoGainControl: false,
      });
    }
  });
});
