import { Dialog, DialogPortal, DialogPrimitive } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { XIcon } from "@phosphor-icons/react";
import { type ReactNode, useRef } from "react";

type CardDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  mark: ReactNode;
  eyebrow: ReactNode;
  eyebrowClassName?: string;
  title: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  /** Ignores Escape, outside clicks and the close button, for example while saving. */
  isDismissLocked?: boolean;
  /** Ignores outside clicks only, for example while a form has unsaved input. */
  isOutsideClickLocked?: boolean;
  /** Overrides the card width; defaults to 30rem, capped at the viewport. */
  widthClassName?: string;
};

/**
 * Centered card dialog matching the Workspace card dialogs: a header with a mark, eyebrow and
 * title, a body, and a tinted footer. Focus starts on the first `[data-autofocus]` element.
 */
export const CardDialog = ({
  isOpen,
  onClose,
  mark,
  eyebrow,
  eyebrowClassName,
  title,
  children,
  footer,
  isDismissLocked = false,
  isOutsideClickLocked = false,
  widthClassName = "w-[min(30rem,calc(100vw-2rem))]",
}: CardDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const requestClose = () => {
    if (!isDismissLocked) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && requestClose()}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
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
          <section
            className={cn(
              "relative flex max-h-[calc(100dvh_-_max(4.5rem,12vh)_-_1rem)] flex-col overflow-hidden rounded-lg bg-popover text-ink ring-1 ring-line duration-300 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 motion-reduce:animate-none",
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
                <DialogPrimitive.Title className="min-w-0 truncate text-heading text-ink">
                  {title}
                </DialogPrimitive.Title>
              </div>
              <DialogPrimitive.Close
                aria-label="Close"
                disabled={isDismissLocked}
                className="-mr-2 -mt-1 grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-muted hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40"
              >
                <XIcon className="size-4" />
              </DialogPrimitive.Close>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-1">{children}</div>

            <footer className="flex items-center justify-between gap-4 border-t border-line bg-sunken/70 px-6 py-3.5">
              {footer}
            </footer>
          </section>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
