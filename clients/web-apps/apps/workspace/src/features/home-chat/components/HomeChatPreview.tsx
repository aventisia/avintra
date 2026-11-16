import { ChatFilePreview, type ChatPreviewFile, type ChatPreviewVersion } from "@avplatform/chat";
import { Dialog, DialogContent, DialogTitle } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";

import { useMediaQuery } from "../hooks/useMediaQuery.hook";

type HomeChatPreviewProps = {
  file: ChatPreviewFile | null;
  versions?: ChatPreviewVersion[];
  activeVersionId?: string;
  onSelectVersion?: (id: string) => void;
  onSaveVersion?: (body: string) => void | Promise<unknown>;
  isSavingVersion?: boolean;
  isLoading: boolean;
  onClose: () => void;
};

const MIN_PANEL_WIDTH = 320;
const MIN_THREAD_WIDTH = 360;
const KEY_STEP = 24;

const useReturnFocusOnClose = () =>
  useEffect(() => {
    const opener = document.activeElement;
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

/** The open file: a panel beside the thread from 1024px, a full-screen sheet below. */
export const HomeChatPreview = ({
  file,
  versions,
  activeVersionId,
  onSelectVersion,
  onSaveVersion,
  isSavingVersion,
  isLoading,
  onClose,
}: HomeChatPreviewProps) => {
  useReturnFocusOnClose();
  const isWide = useMediaQuery("(min-width: 1024px)");
  const asideRef = useRef<HTMLElement>(null);
  const [panelWidth, setPanelWidth] = useState<number | null>(null);
  const dragStart = useRef<{ x: number; width: number } | null>(null);
  const clampWidth = (width: number) => {
    const row = asideRef.current?.parentElement?.clientWidth ?? Infinity;
    return Math.round(Math.min(Math.max(width, MIN_PANEL_WIDTH), row - MIN_THREAD_WIDTH));
  };
  const currentWidth = () => asideRef.current?.getBoundingClientRect().width ?? 0;
  const resetWidth = () => setPanelWidth(null);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, width: currentWidth() };
  };
  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const { x, width } = dragStart.current;
    setPanelWidth(clampWidth(width + (x - event.clientX)));
  };
  const endDrag = () => {
    dragStart.current = null;
  };
  const nudge = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowLeft" ? KEY_STEP : event.key === "ArrowRight" ? -KEY_STEP : 0;
    if (!step) return;
    event.preventDefault();
    setPanelWidth(clampWidth(currentWidth() + step));
  };

  const preview = (
    <ChatFilePreview
      file={file}
      versions={versions}
      activeVersionId={activeVersionId}
      onSelectVersion={onSelectVersion}
      onSaveVersion={onSaveVersion}
      isSavingVersion={isSavingVersion}
      isLoading={isLoading}
      onClose={onClose}
    />
  );

  if (isWide)
    return (
      <>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize file preview"
          aria-valuenow={panelWidth ?? undefined}
          aria-valuemin={MIN_PANEL_WIDTH}
          tabIndex={0}
          title="Drag to resize. Double-click to reset."
          onPointerDown={startDrag}
          onPointerMove={drag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={resetWidth}
          onKeyDown={nudge}
          className="group relative w-px shrink-0 cursor-col-resize touch-none bg-line outline-none before:absolute before:inset-y-0 before:-left-1.5 before:-right-1.5 before:content-[''] focus-visible:bg-primary hover:bg-primary/60"
        />
        <aside
          ref={asideRef}
          style={panelWidth ? { width: panelWidth } : undefined}
          className={cn(
            "shrink-0 duration-200 animate-in fade-in-0 slide-in-from-right-4 motion-reduce:animate-none",
            !panelWidth && "w-[min(50%,44rem)]",
          )}
        >
          {preview}
        </aside>
      </>
    );

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        side="right"
        aria-describedby={undefined}
        className="w-full max-w-none rounded-none p-0 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] sm:max-w-none"
      >
        <DialogTitle className="sr-only">{file?.name ?? "File preview"}</DialogTitle>
        {preview}
      </DialogContent>
    </Dialog>
  );
};
