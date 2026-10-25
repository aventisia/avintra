import { CheckIcon, CopyIcon } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { Button } from "@/ui/components/buttons";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";

/**
 * Props for the {@link CopyButton} component.
 *
 * Extends native `button` props and renders a compact copy/check toggle button
 * with an optional tooltip.
 */
type CopyButtonProps = Omit<ComponentPropsWithoutRef<"button">, "children" | "type"> & {
  /** Whether the copied state is currently active. */
  isCopied: boolean;
  /** Class applied to the copy/check icon. */
  iconClassName?: string;
  /**
   * Whether to wrap the button in a tooltip.
   *
   * Set this to `false` when the button is already rendered inside another
   * tooltip to avoid nested-tooltip conflicts.
   */
  showTooltip?: boolean;
};

/**
 * A compact copy/check toggle button.
 *
 * Optionally wraps the button in a tooltip. The caller should set
 * `showTooltip={false}` when this button is rendered inside another tooltip.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ isCopied, iconClassName, showTooltip = true, className, ...buttonProps }, ref) => {
    const button = (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Copy"
        title={showTooltip ? undefined : isCopied ? "Copied" : "Copy"}
        className={cn(
          "h-[1.45em] min-h-0 w-[1.45em] min-w-0 shrink-0 p-0",
          "text-[1em] text-muted-foreground",
          "opacity-35 transition-[opacity,color] duration-150",
          "hover:opacity-100 focus-visible:opacity-100",
          "hover:text-primary focus-visible:text-primary",
          "disabled:pointer-events-none disabled:opacity-20",
          className,
        )}
        {...buttonProps}
      >
        {isCopied ? (
          <CheckIcon className={cn("size-[0.8em]", iconClassName)} />
        ) : (
          <CopyIcon className={cn("size-[0.8em]", iconClassName)} />
        )}
      </Button>
    );

    if (!showTooltip) {
      return button;
    }

    return (
      <Tooltip content={isCopied ? "Copied" : "Copy"} delayDuration={50} side="top">
        {button}
      </Tooltip>
    );
  },
);

CopyButton.displayName = "CopyButton";
