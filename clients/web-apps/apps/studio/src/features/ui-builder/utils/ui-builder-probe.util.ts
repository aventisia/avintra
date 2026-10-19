import {
  UI_BUILDER_HOST_SOURCE,
  UI_BUILDER_RUNTIME_SOURCE,
  prepareUiBuilderDocument,
  withUiBuilderQueryHints,
} from "@avplatform/ui/ui-builder-host";

const PROBE_TIMEOUT_MS = 12000;
const PROBE_SETTLE_MS = 400;
const PROBE_VIEWPORT = { width: 1280, height: 800 };

/** Outcome of rendering a document once in an off-screen sandbox. */
export type UiBuilderProbeResult = {
  markup: string;
  errors: string[];
  timedOut: boolean;
};

/**
 * Renders a generated document once in an off-screen `allow-scripts` sandbox and reports
 * the rendered markup and any runtime errors. Data requests are answered with empty pages
 * so connected interfaces render their empty states.
 */
export const probeUiBuilderDocument = (html: string): Promise<UiBuilderProbeResult> =>
  new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    Object.assign(iframe.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: `${PROBE_VIEWPORT.width}px`,
      height: `${PROBE_VIEWPORT.height}px`,
      opacity: "0",
      pointerEvents: "none",
    });

    const errors: string[] = [];
    let markup = "";
    let settleTimer: number | undefined;

    const finish = (timedOut: boolean) => {
      window.clearTimeout(timeoutTimer);
      window.clearTimeout(settleTimer);
      window.removeEventListener("message", handleMessage);
      iframe.remove();
      resolve({ markup, errors, timedOut });
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data as Record<string, unknown> | null;
      if (!data || data.source !== UI_BUILDER_RUNTIME_SOURCE) return;

      if (data.type === "runtime:error" && typeof data.message === "string") {
        if (!errors.includes(data.message)) errors.push(data.message);
      } else if (data.type === "data:request" && typeof data.id === "string") {
        const isRead = data.operation === "list" || data.operation === "query";
        iframe.contentWindow?.postMessage(
          {
            source: UI_BUILDER_HOST_SOURCE,
            type: "data:response",
            id: data.id,
            ok: isRead,
            data:
              data.operation === "query"
                ? withUiBuilderQueryHints(data.params, { queries: {} })
                : isRead
                  ? { items: [], total: 0 }
                  : undefined,
            error: isRead ? undefined : "Writes are disabled during the quality check.",
          },
          "*",
        );
      } else if (data.type === "runtime:ready") {
        markup = typeof data.markup === "string" ? data.markup : "";
        settleTimer = window.setTimeout(() => finish(false), PROBE_SETTLE_MS);
      }
    };

    const timeoutTimer = window.setTimeout(() => finish(true), PROBE_TIMEOUT_MS);
    window.addEventListener("message", handleMessage);
    iframe.srcdoc = prepareUiBuilderDocument(html, { probe: true });
    document.body.appendChild(iframe);
  });
