import { describe, expect, it } from "vitest";

import {
  type ShareLinkState,
  initialShareLinkState,
  shareLinkReducer,
} from "../share-link-flow.util";

const state = (
  status: ShareLinkState["status"],
  link: string | null = null,
  error: ShareLinkState["error"] = null,
): ShareLinkState => ({ status, link, error });

describe("shareLinkReducer", () => {
  it("starts off for an unshared item", () => {
    expect(initialShareLinkState(false)).toEqual(state("off"));
  });

  it("starts by getting the link for a shared item", () => {
    expect(initialShareLinkState(true)).toEqual(state("creating"));
  });

  it("create moves off to creating and clears an old error", () => {
    expect(shareLinkReducer(state("off", null, "create"), { type: "create" })).toEqual(
      state("creating"),
    );
  });

  it("created stores the link and turns sharing on", () => {
    expect(shareLinkReducer(state("creating"), { type: "created", link: "https://x/y" })).toEqual(
      state("on", "https://x/y"),
    );
  });

  it("a failed create goes back to off with a create error", () => {
    expect(shareLinkReducer(state("creating"), { type: "createFailed" })).toEqual(
      state("off", null, "create"),
    );
  });

  it("stop keeps the link while stopping", () => {
    expect(shareLinkReducer(state("on", "L"), { type: "stop" })).toEqual(state("stopping", "L"));
  });

  it("stopped returns to off and forgets the link", () => {
    expect(shareLinkReducer(state("stopping", "L"), { type: "stopped" })).toEqual(state("off"));
  });

  it("a failed stop returns to on with the link and a stop error", () => {
    expect(shareLinkReducer(state("stopping", "L"), { type: "stopFailed" })).toEqual(
      state("on", "L", "stop"),
    );
  });

  it("create is ignored unless off", () => {
    for (const current of [state("creating"), state("on", "L"), state("stopping", "L")])
      expect(shareLinkReducer(current, { type: "create" })).toBe(current);
  });

  it("stop is ignored unless on", () => {
    for (const current of [state("off"), state("creating"), state("stopping", "L")])
      expect(shareLinkReducer(current, { type: "stop" })).toBe(current);
  });
});
