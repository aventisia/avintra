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
      "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-dashed bg-background px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50",
      pressed
        ? "border-solid border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
        : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900",
    )}
  >
    <Archive className="size-3.5" />
    Archived
    <span
      className={cn(
        "rounded px-1 text-2xs tabular-nums",
        pressed ? "bg-amber-200 text-amber-900" : "bg-slate-100 text-slate-500",
      )}
    >
      {count}
    </span>
  </button>
);
