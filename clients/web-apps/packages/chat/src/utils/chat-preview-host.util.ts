const PREVIEW_READY = "avintra-chat-preview:ready";
const PREVIEW_RENDER = "avintra-chat-preview:render";

/** Sandbox flags shared by the preview frame and the page it hosts. */
export const CHAT_PREVIEW_SANDBOX = "allow-scripts allow-forms allow-modals";

/** The isolated page, shipped in the app's `public/` folder, that runs generated HTML. */
export const chatPreviewHostUrl = (): string => `${import.meta.env.BASE_URL}chat-preview.html`;

type MessageTarget = Pick<Window, "addEventListener" | "removeEventListener">;

/**
 * Sends `html` to the preview page in `getHost()` each time that page reports it is ready.
 * Returns a function that stops listening.
 */
export const serveHtmlToPreviewHost = (
  getHost: () => MessageEventSource | null,
  html: string | Promise<string>,
  title: string,
  listener: MessageTarget = window,
): (() => void) => {
  const onMessage = (event: MessageEvent) => {
    const host = getHost();
    if (!host || event.source !== host) return;
    if ((event.data as { type?: unknown } | null)?.type !== PREVIEW_READY) return;
    const send = (page: string) =>
      // IMPORTANT NOTE: the host's origin is opaque under its sandbox, so no narrower target origin matches.
      (host as Window).postMessage({ type: PREVIEW_RENDER, html: page, title }, "*");
    if (typeof html === "string") send(html);
    else void html.then(send);
  };
  listener.addEventListener("message", onMessage as EventListener);
  return () => listener.removeEventListener("message", onMessage as EventListener);
};

/** Opens generated HTML in a new tab through the preview page; the page drops its opener once it renders. */
export const openHtmlInPreviewTab = (html: string | Promise<string>, title: string): void => {
  const tab = window.open(chatPreviewHostUrl(), "_blank");
  if (!tab) return;
  const stop = serveHtmlToPreviewHost(() => tab, html, title);
  setTimeout(stop, 60_000);
};
