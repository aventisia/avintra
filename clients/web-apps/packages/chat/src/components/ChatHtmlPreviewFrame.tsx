import { useEffect, useRef } from "react";

import {
  CHAT_PREVIEW_SANDBOX,
  chatPreviewHostUrl,
  serveHtmlToPreviewHost,
} from "../utils/chat-preview-host.util";

type ChatHtmlPreviewFrameProps = {
  html: string;
  title: string;
};

/** Runs a generated HTML page, scripts included, inside the isolated preview page. */
export const ChatHtmlPreviewFrame = ({ html, title }: ChatHtmlPreviewFrameProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(
    () => serveHtmlToPreviewHost(() => frameRef.current?.contentWindow ?? null, html, title),
    [html, title],
  );

  return (
    <iframe
      key={html}
      ref={frameRef}
      src={chatPreviewHostUrl()}
      title={title}
      sandbox={CHAT_PREVIEW_SANDBOX}
      className="size-full border-0 bg-white"
    />
  );
};
