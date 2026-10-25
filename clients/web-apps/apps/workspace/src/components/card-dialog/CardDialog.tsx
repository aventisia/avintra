import { Dialog, DialogPortal, DialogPrimitive } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { X } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { type ReactNode, useRef } from "react";

type CardDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  mark: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  eyebrowClassName?: string;
  /** Overrides the card width; defaults to 30rem, capped at the viewport. */
  widthClassName?: string;
  /** Ignores Escape, outside clicks and the close button, for example while saving. */
  isDismissLocked?: boolean;
  /** Ignores outside clicks only, for example while a form has unsaved input. */
  isOutsideClickLocked?: boolean;
};

/**
 * Centered card dialog in the agent access style: header with a mark, eyebrow and title, a
 * scrolling body, and a tinted footer. Focus starts on the first `[data-autofocus]` element.
 */
export const CardDialog = ({
  isOpen,
  onClose,
  mark,
  eyebrow,
  title,
  children,
  footer,
  eyebrowClassName,
  widthClassName = "w-[min(30rem,calc(100vw-2rem))]",
  isDismissLocked = false,
  isOutsideClickLocked = false,
}: CardDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const requestClose = () => {
    if (!isDismissLocked) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && requestClose()}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          ref={contentRef}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            const autofocusTarget =
              contentRef.current?.querySelector<HTMLElement>("[data-autofocus]");
            if (!autofocusTarget) return;
            event.preventDefault();
            autofocusTarget.focus();
          }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget && !isOutsideClickLocked) requestClose();
          }}
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pb-4 pt-[max(4.5rem,12vh)] outline-none data-[state=closed]:duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <MotionConfig reducedMotion="user">
            <motion.section
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.16 }}
              className={cn(
                "relative flex max-h-[calc(100dvh_-_max(4.5rem,12vh)_-_1rem)] flex-col overflow-hidden rounded-[20px] bg-popover text-slate-900 shadow-[0_32px_80px_-16px_rgba(15,23,42,0.4)] ring-1 ring-slate-900/[0.06]",
                widthClassName,
              )}
            >
              <header className="flex items-start gap-4 px-6 pb-4 pt-6">
                {mark}
                <div className="mt-1 min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.1em] text-primary",
                      eyebrowClassName,
                    )}
                  >
                    {eyebrow}
                  </p>
                  <DialogPrimitive.Title className="truncate text-[18px] font-semibold tracking-[-0.01em] text-slate-900">
                    {title}
                  </DialogPrimitive.Title>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={requestClose}
                  disabled={isDismissLocked}
                  className="-mr-2 -mt-1 grid size-8 place-items-center rounded-lg text-slate-400 outline-none transition hover:bg-muted hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-40"
                >
                  <X className="size-4" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-1">{children}</div>

              <footer className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-3.5">
                {footer}
              </footer>
            </motion.section>
          </MotionConfig>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
