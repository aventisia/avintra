import {
  UI_BUILDER_HOST_SOURCE,
  UI_BUILDER_RUNTIME_SOURCE,
  prepareUiBuilderDocument,
  withUiBuilderQueryHints,
} from "@avplatform/ui/ui-builder-host";

const PROBE_TIMEOUT_MS = 12000;
const PROBE_CAPTURE_TIMEOUT_MS = 20000;
const PROBE_SETTLE_MS = 400;
const PROBE_RESIZE_SETTLE_MS = 350;
const PROBE_VIEWPORT = { width: 1280, height: 800 };
const PROBE_MOBILE_WIDTH = 390;

/** Screenshots of a probed document, as JPEG data URLs. */
export type UiBuilderProbeScreenshots = { desktop?: string; mobile?: string };

/** Outcome of rendering a document once in an off-screen sandbox. */
export type UiBuilderProbeResult = {
  markup: string;
  errors: string[];
  timedOut: boolean;
  screenshots: UiBuilderProbeScreenshots;
};

/**
 * Renders a generated document once in an off-screen `allow-scripts` sandbox and reports
 * the rendered markup and any runtime errors. Data requests are answered with empty pages
 * so connected interfaces render their empty states.
 */
export const probeUiBuilderDocument = (
  html: string,
  options: { capture?: boolean; assets?: Record<string, string> } = {},
): Promise<UiBuilderProbeResult> =>
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
    const screenshots: UiBuilderProbeScreenshots = {};
    const captureRequests = new Map<string, (image: string | undefined) => void>();
    let markup = "";
    let settleTimer: number | undefined;
    let isFinished = false;
    let captureSequence = 0;

    const finish = (timedOut: boolean) => {
      if (isFinished) return;
      isFinished = true;
      window.clearTimeout(timeoutTimer);
      window.clearTimeout(settleTimer);
      window.removeEventListener("message", handleMessage);
      iframe.remove();
      resolve({ markup, errors, timedOut, screenshots });
    };

    const capture = (width: number) =>
      new Promise<string | undefined>((resolveCapture) => {
        captureSequence += 1;
        const id = `capture-${captureSequence}`;
        captureRequests.set(id, resolveCapture);
        iframe.contentWindow?.postMessage(
          { source: UI_BUILDER_HOST_SOURCE, type: "probe:capture", id, width },
          "*",
        );
      });

    const wait = (milliseconds: number) =>
      new Promise((resolveWait) => window.setTimeout(resolveWait, milliseconds));

    const captureViewports = async () => {
      try {
        screenshots.desktop = await capture(PROBE_VIEWPORT.width);
        iframe.style.width = `${PROBE_MOBILE_WIDTH}px`;
        await wait(PROBE_RESIZE_SETTLE_MS);
        screenshots.mobile = await capture(PROBE_MOBILE_WIDTH);
      } finally {
        finish(false);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data as Record<string, unknown> | null;
      if (!data || data.source !== UI_BUILDER_RUNTIME_SOURCE) return;

      if (data.type === "probe:capture" && typeof data.id === "string") {
        captureRequests.get(data.id)?.(typeof data.image === "string" ? data.image : undefined);
        captureRequests.delete(data.id);
      } else if (data.type === "runtime:error" && typeof data.message === "string") {
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
        settleTimer = window.setTimeout(() => {
          if (options.capture && errors.length === 0) void captureViewports();
          else finish(false);
        }, PROBE_SETTLE_MS);
      }
    };

    const timeoutTimer = window.setTimeout(
      () => (markup ? finish(false) : finish(true)),
      options.capture ? PROBE_CAPTURE_TIMEOUT_MS : PROBE_TIMEOUT_MS,
    );
    window.addEventListener("message", handleMessage);
    iframe.srcdoc = prepareUiBuilderDocument(html, { probe: true, assets: options.assets });
    document.body.appendChild(iframe);
  });
