import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

export type ChatIconButtonProps = ComponentPropsWithoutRef<"button"> & {
  /** Accessible name, also shown as the tooltip. */
  label: string;
};

/** Quiet square icon button with a tooltip, for message and code actions. */
export const ChatIconButton = forwardRef<HTMLButtonElement, ChatIconButtonProps>(
  function ChatIconButton({ label, className, ...props }, ref) {
    return (
      <Tooltip content={label} side="bottom">
        <button
          ref={ref}
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
            className,
          )}
          {...props}
        />
      </Tooltip>
    );
  },
);
