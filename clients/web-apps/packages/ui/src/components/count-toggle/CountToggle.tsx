import type { ComponentType } from "react";

import { cn } from "@/ui/lib";
import { type IconProps } from "@/ui/types";

export type CountToggleProps = {
  Icon: ComponentType<IconProps>;
  label: string;
  count: number;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  title?: string;
};

/**
 * Toolbar toggle with an icon, a label and a count pill; disabled while unpressed with a zero count.
 */
export const CountToggle = ({
  Icon,
  label,
  count,
  pressed,
  onPressedChange,
  title,
}: CountToggleProps) => (
  <button
    type="button"
    aria-pressed={pressed}
    disabled={count === 0 && !pressed}
    title={title}
    onClick={() => onPressedChange(!pressed)}
    className={cn(
      "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50",
      pressed
        ? "border-solid border-primary bg-selected text-primary-text"
        : "border-transparent text-ink-2 hover:bg-hover hover:text-ink",
    )}
  >
    <Icon className="size-3.5" />
    {label}
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
