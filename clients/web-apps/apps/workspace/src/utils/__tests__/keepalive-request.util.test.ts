import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KEEPALIVE_REQUEST } from "../keepalive-request.util";

describe("keepalive request", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a keepalive request with cookies through axios", async () => {
    const fetch = vi.fn<(request: Request) => Promise<Response>>(
      async () => new Response("{}", { headers: { "content-type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetch);

    await axios.create({ withCredentials: true }).delete("http://x/api/c1", KEEPALIVE_REQUEST);

    const request = fetch.mock.calls[0][0];
    expect(request.keepalive).toBe(true);
    expect(request.credentials).toBe("include");
    expect(request.method).toBe("DELETE");
  });
});
