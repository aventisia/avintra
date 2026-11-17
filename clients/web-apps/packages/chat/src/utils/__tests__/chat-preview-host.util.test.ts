import { describe, expect, it, vi } from "vitest";

import { serveHtmlToPreviewHost } from "../chat-preview-host.util";

const fakeListener = () => {
  const handlers = new Set<(event: MessageEvent) => void>();
  return {
    addEventListener: (_: string, handler: (event: MessageEvent) => void) => handlers.add(handler),
    removeEventListener: (_: string, handler: (event: MessageEvent) => void) =>
      handlers.delete(handler),
    dispatch: (event: Partial<MessageEvent>) =>
      handlers.forEach((handler) => handler(event as MessageEvent)),
    get size() {
      return handlers.size;
    },
  };
};

const ready = { type: "avintra-chat-preview:ready" };

describe("serveHtmlToPreviewHost", () => {
  it("sends the page to the host once it reports ready", () => {
    const host = { postMessage: vi.fn() };
    const listener = fakeListener();
    serveHtmlToPreviewHost(
      () => host as unknown as Window,
      "<p>Hi</p>",
      "Form.html",
      listener as never,
    );

    listener.dispatch({ source: host as unknown as Window, data: ready });

    expect(host.postMessage).toHaveBeenCalledWith(
      { type: "avintra-chat-preview:render", html: "<p>Hi</p>", title: "Form.html" },
      "*",
    );
  });

  it("ignores ready messages from any other window", () => {
    const host = { postMessage: vi.fn() };
    const listener = fakeListener();
    serveHtmlToPreviewHost(() => host as unknown as Window, "<p>Hi</p>", "", listener as never);

    listener.dispatch({ source: {} as Window, data: ready });

    expect(host.postMessage).not.toHaveBeenCalled();
  });

  it("ignores other message types from the host", () => {
    const host = { postMessage: vi.fn() };
    const listener = fakeListener();
    serveHtmlToPreviewHost(() => host as unknown as Window, "<p>Hi</p>", "", listener as never);

    listener.dispatch({ source: host as unknown as Window, data: { type: "other" } });

    expect(host.postMessage).not.toHaveBeenCalled();
  });

  it("stops listening when disposed", () => {
    const listener = fakeListener();
    const stop = serveHtmlToPreviewHost(() => null, "", "", listener as never);
    expect(listener.size).toBe(1);
    stop();
    expect(listener.size).toBe(0);
  });
});
