import { Dialog, DialogPortal, DialogPrimitive } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { MotionConfig, motion } from "motion/react";
import { type ComponentProps, type ReactNode, useRef } from "react";

type CardDialogFrameProps = Pick<
  ComponentProps<typeof DialogPrimitive.Content>,
  "aria-describedby"
> & {
  isOpen: boolean;
  onClose: () => void;
  /** Ignores outside clicks only, for example while a form has unsaved input. */
  isOutsideClickLocked?: boolean;
  /** Places the card in the viewport. */
  className?: string;
  panelClassName?: string;
  children: ReactNode;
};

/**
 * Modal shell for card dialogs: a scrim, close on outside click, and a spring-in card whose
 * focus starts on the first `[data-autofocus]` element.
 */
export const CardDialogFrame = ({
  isOpen,
  onClose,
  isOutsideClickLocked = false,
  className,
  panelClassName,
  children,
  ...contentProps
}: CardDialogFrameProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          {...contentProps}
          ref={contentRef}
          onOpenAutoFocus={(event) => {
            const autofocusTarget =
              contentRef.current?.querySelector<HTMLElement>("[data-autofocus]");
            if (!autofocusTarget) return;
            event.preventDefault();
            autofocusTarget.focus();
          }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget && !isOutsideClickLocked) onClose();
          }}
          className={cn(
            "fixed inset-0 z-50 flex justify-center outline-none data-[state=closed]:duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className,
          )}
        >
          <MotionConfig reducedMotion="user">
            <motion.section
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.16 }}
              className={cn("relative flex flex-col overflow-hidden text-ink", panelClassName)}
            >
              {children}
            </motion.section>
          </MotionConfig>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
