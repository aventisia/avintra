import { useEffect, useRef } from "react";

import {
  UI_BUILDER_BRIDGE_SOURCE,
  UI_BUILDER_SELECTION_MESSAGE_TYPE,
} from "../constants/ui-builder-selection.constant";
import { type UiBuilderSelection } from "../types/ui-builder-selection.type";

type UiBuilderPreviewProps = {
  html: string;
  title: string;
  bridgeEnabled?: boolean;
  onSelection?: (selection: UiBuilderSelection) => void;
};

const MAX_BRIDGE_FIELD_LENGTH = 8192;

const isUiBuilderSelectionMessage = (
  data: unknown,
): data is { selector: string; outerHtml: string; textContent: string } => {
  if (!data || typeof data !== "object") return false;

  const candidate = data as Record<string, unknown>;
  if (candidate.source !== UI_BUILDER_BRIDGE_SOURCE) return false;
  if (candidate.type !== UI_BUILDER_SELECTION_MESSAGE_TYPE) return false;
  if (typeof candidate.selector !== "string" || !candidate.selector) return false;
  if (typeof candidate.outerHtml !== "string" || !candidate.outerHtml) return false;
  if (typeof candidate.textContent !== "string") return false;
  if (candidate.selector.length > MAX_BRIDGE_FIELD_LENGTH) return false;
  if (candidate.outerHtml.length > MAX_BRIDGE_FIELD_LENGTH) return false;
  if (candidate.textContent.length > MAX_BRIDGE_FIELD_LENGTH) return false;

  return true;
};

export const UiBuilderPreview = ({
  html,
  title,
  bridgeEnabled = false,
  onSelection,
}: UiBuilderPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!bridgeEnabled) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isUiBuilderSelectionMessage(event.data)) return;

      onSelection?.({
        selector: event.data.selector,
        outerHtml: event.data.outerHtml,
        textContent: event.data.textContent,
      });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [bridgeEnabled, onSelection]);

  if (!html.trim()) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white text-sm text-muted-foreground">
        Describe the interface you want, then send your first prompt.
      </div>
    );
  }

  // IMPORTANT NOTE: generated HTML must only ever run inside a sandbox limited to
  // `allow-scripts`; adding `allow-same-origin` (or any other token) would let the
  // generated document reach the studio origin.
  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={html}
      sandbox="allow-scripts"
      className="h-full w-full border-0 bg-white"
    />
  );
};
