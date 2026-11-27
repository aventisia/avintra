import { QuotesIcon } from "@phosphor-icons/react";
import { type RefObject, useEffect, useState } from "react";

import { type ChatSelectionQuote } from "../utils/selection-quote.util";

type ChatQuoteSelectionButtonProps = {
  bodyRef: RefObject<HTMLElement>;
  fileName: string;
  onQuote: (quote: ChatSelectionQuote) => void;
};

type Position = { left: number; top: number };

const HALF_BUTTON_WIDTH = 64;
const BUTTON_OFFSET = 40;
const EDGE_GAP = 4;

const readPosition = (body: HTMLElement | null): Position | null => {
  const container = body?.parentElement;
  const selection = window.getSelection();
  if (!body || !container || !selection || selection.isCollapsed) return null;
  const { anchorNode, focusNode } = selection;
  if (!anchorNode || !focusNode || !body.contains(anchorNode) || !body.contains(focusNode))
    return null;
  if (!selection.toString().trim()) return null;
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  const box = container.getBoundingClientRect();
  const centre = rect.left + rect.width / 2 - box.left;
  return {
    left: Math.min(
      Math.max(centre, HALF_BUTTON_WIDTH),
      Math.max(box.width - HALF_BUTTON_WIDTH, HALF_BUTTON_WIDTH),
    ),
    top: Math.max(rect.top - box.top - BUTTON_OFFSET, EDGE_GAP),
  };
};

/** A button beside selected preview text; the container around the body must be `relative`. */
export const ChatQuoteSelectionButton = ({
  bodyRef,
  fileName,
  onQuote,
}: ChatQuoteSelectionButtonProps) => {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    const body = bodyRef.current;
    const container = body?.parentElement;
    const update = () => setPosition(readPosition(bodyRef.current));
    const hideOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPosition(null);
    };
    const resizeObserver = new ResizeObserver(update);
    if (container) resizeObserver.observe(container);
    document.addEventListener("selectionchange", update);
    document.addEventListener("keydown", hideOnEscape);
    container?.addEventListener("scroll", update, true);
    return () => {
      resizeObserver.disconnect();
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("keydown", hideOnEscape);
      container?.removeEventListener("scroll", update, true);
    };
  }, [bodyRef]);

  if (!position) return null;

  const quote = () => {
    const text = window.getSelection()?.toString() ?? "";
    window.getSelection()?.removeAllRanges();
    setPosition(null);
    onQuote({ fileName, text });
  };

  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={quote}
      style={{ left: position.left, top: position.top }}
      className="absolute z-10 inline-flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink shadow-md transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus [&_svg]:size-3.5"
    >
      <QuotesIcon />
      Ask about this
    </button>
  );
};
