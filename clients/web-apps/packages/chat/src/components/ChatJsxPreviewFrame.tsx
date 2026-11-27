import { useEffect, useState } from "react";

import { buildJsxAppPage } from "../utils/jsx-app.util";
import { ChatHtmlPreviewFrame } from "./ChatHtmlPreviewFrame";

type ChatJsxPreviewFrameProps = {
  source: string;
  title: string;
};

/** Compiles a generated React app and runs it inside the isolated preview page. */
export const ChatJsxPreviewFrame = ({ source, title }: ChatJsxPreviewFrameProps) => {
  const [built, setBuilt] = useState<{ source: string; page: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void buildJsxAppPage(source, title).then((page) => {
      if (!cancelled) setBuilt({ source, page });
    });
    return () => {
      cancelled = true;
    };
  }, [source, title]);

  if (built?.source !== source) return <div className="size-full bg-white" />;
  return <ChatHtmlPreviewFrame html={built.page} title={title} />;
};
