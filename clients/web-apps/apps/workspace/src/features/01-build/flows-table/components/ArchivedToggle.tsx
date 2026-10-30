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
      "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50",
      pressed
        ? "border-solid border-primary bg-selected text-primary-text"
        : "border-transparent text-ink-2 hover:bg-hover hover:text-ink",
    )}
  >
    <Archive className="size-3.5" />
    Archived
    <span
      className={cn(
        "rounded-sm px-1.5 py-px font-mono text-[11px] font-medium tabular-nums",
        pressed ? "bg-primary/15 text-primary-text" : "bg-sunken text-muted-foreground",
      )}
    >
      {count}
    </span>
  </button>
);
