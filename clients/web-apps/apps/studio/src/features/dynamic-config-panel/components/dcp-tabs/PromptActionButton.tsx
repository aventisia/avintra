import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { SparklesIcon } from "lucide-react";

type PromptActionButtonProps = {
  /** Button label when idle. */
  label: string;
  /** Button label shown while the action is running. */
  loadingLabel: string;
  /** Whether the action is in progress. */
  isPending: boolean;
  /** Disables the button. */
  disabled?: boolean;
  /** Click handler. */
  onClick: () => void;
};

/**
 * Shared "Improve with AI" style action button so every prompt field's AI action
 * looks and behaves identically regardless of which backend powers it.
 */
const PromptActionButton = ({
  label,
  loadingLabel,
  isPending,
  disabled,
  onClick,
}: PromptActionButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    type="button"
    disabled={disabled || isPending}
    className={cn(
      "flex w-36 items-center gap-2 rounded-full border-primary text-primary transition-all duration-200",
      isPending ? "cursor-wait" : "hover:bg-primary hover:text-primary-foreground",
    )}
    onClick={onClick}
  >
    {isPending ? (
      <>
        <LoadingSpinner className="h-4 w-4 animate-spin" />
        {loadingLabel}
      </>
    ) : (
      <>
        <SparklesIcon className="h-4 w-4" />
        {label}
      </>
    )}
  </Button>
);

PromptActionButton.displayName = "PromptActionButton";

export { PromptActionButton, type PromptActionButtonProps };
