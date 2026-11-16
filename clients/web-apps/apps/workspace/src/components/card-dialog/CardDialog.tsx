import { DialogPrimitive } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { CardDialogFrame } from "./CardDialogFrame";

type CardDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  mark: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  /** Rendered after the title, outside the dialog's accessible name, for example a copy button. */
  titleAccessory?: ReactNode;
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
  titleAccessory,
  children,
  footer,
  eyebrowClassName,
  widthClassName = "w-[min(30rem,calc(100vw-2rem))]",
  isDismissLocked = false,
  isOutsideClickLocked = false,
}: CardDialogProps) => {
  const requestClose = () => {
    if (!isDismissLocked) onClose();
  };

  return (
    <CardDialogFrame
      isOpen={isOpen}
      onClose={requestClose}
      isOutsideClickLocked={isOutsideClickLocked}
      aria-describedby={undefined}
      className="items-start px-4 pb-4 pt-[max(4.5rem,12vh)]"
      panelClassName={cn(
        "max-h-[calc(100dvh_-_max(4.5rem,12vh)_-_1rem)] rounded-lg bg-popover ring-1 ring-line",
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
          <div className="flex min-w-0 items-center gap-1">
            <DialogPrimitive.Title className="min-w-0 truncate text-heading text-ink">
              {title}
            </DialogPrimitive.Title>
            {titleAccessory}
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={requestClose}
          disabled={isDismissLocked}
          className="-mr-2 -mt-1 grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-muted hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40"
        >
          <XIcon className="size-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-1">{children}</div>

      <footer className="flex items-center justify-between gap-4 border-t border-line bg-sunken/70 px-6 py-3.5">
        {footer}
      </footer>
    </CardDialogFrame>
  );
};
