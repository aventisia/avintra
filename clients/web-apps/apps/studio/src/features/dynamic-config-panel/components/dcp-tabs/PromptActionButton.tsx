import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { SparkleIcon } from "@phosphor-icons/react";

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
      "group flex items-center gap-2 border-transparent text-ink transition-shadow duration-200",
      "[background:linear-gradient(100deg,color-mix(in_srgb,var(--primary-base)_9%,var(--surface)),color-mix(in_srgb,var(--ai-magenta)_6%,var(--surface))_55%,color-mix(in_srgb,var(--ai-sky)_7%,var(--surface)))_padding-box,linear-gradient(100deg,color-mix(in_srgb,var(--primary-base)_55%,transparent),color-mix(in_srgb,var(--ai-magenta)_45%,transparent),color-mix(in_srgb,var(--ai-sky)_50%,transparent))_border-box]",
      isPending
        ? "cursor-wait"
        : "hover:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary-base)_10%,transparent),0_4px_14px_-4px_color-mix(in_srgb,var(--ai-magenta)_40%,transparent)]",
    )}
    onClick={onClick}
  >
    {isPending ? (
      <>
        <LoadingSpinner className="size-4 animate-spin text-primary-text" />
        {loadingLabel}
      </>
    ) : (
      <>
        <SparkleIcon
          weight="duotone"
          className="size-4 text-primary-text transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transition-none"
        />
        <span className="bg-[linear-gradient(90deg,var(--primary-text),color-mix(in_srgb,var(--ai-magenta-text)_70%,var(--primary-text)))] bg-clip-text font-medium text-transparent">
          {label}
        </span>
      </>
    )}
  </Button>
);

PromptActionButton.displayName = "PromptActionButton";

export { PromptActionButton, type PromptActionButtonProps };
