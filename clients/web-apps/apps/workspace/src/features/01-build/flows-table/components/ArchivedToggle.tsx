import { cn } from "@avplatform/ui/lib";
import { Archive } from "lucide-react";

type ArchivedToggleProps = {
  count: number;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
};

/**
 * Toolbar toggle that switches the list between active and archived agents, with how many are archived.
 */
export const ArchivedToggle = ({ count, pressed, onPressedChange }: ArchivedToggleProps) => (
  <button
    type="button"
    aria-pressed={pressed}
    disabled={count === 0 && !pressed}
    title={pressed ? "Show active agents" : "Show archived agents"}
    onClick={() => onPressedChange(!pressed)}
    className={cn(
      "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-dashed bg-background px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50",
      pressed
        ? "border-solid border-primary bg-selected text-primary-text"
        : "border-line text-ink-2 hover:border-line-strong hover:bg-sunken hover:text-ink",
    )}
  >
    <Archive className="size-3.5" />
    Archived
    <span
      className={cn(
        "rounded px-1 text-2xs tabular-nums",
        pressed
          ? "bg-primary/15 text-primary-text font-mono"
          : "bg-sunken font-mono text-muted-foreground",
      )}
    >
      {count}
    </span>
  </button>
);
