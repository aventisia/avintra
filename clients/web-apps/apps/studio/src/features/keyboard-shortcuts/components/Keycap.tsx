import { cn } from "@avplatform/ui/lib";
import type { ReactNode } from "react";

type KeycapSize = "xs" | "sm" | "lg";

type KeycapProps = {
  children: ReactNode;
  /** Spoken key name when the cap shows a symbol. */
  name?: string;
  isPressed?: boolean;
  size?: KeycapSize;
  className?: string;
};

const SIZE_CLASS: Record<KeycapSize, string> = {
  xs: "size-[18px] rounded-[4px] border-b-[1.5px] text-[10px]",
  sm: "h-6 min-w-6 rounded-[5px] border-b-2 px-1.5 text-[11.5px]",
  lg: "h-10 min-w-10 rounded-md border-b-[3px] px-3 text-[15px] text-ink shadow-[0_1px_2px_rgba(18,17,31,0.06)]",
};

const SYMBOL_SIZE_CLASS: Record<KeycapSize, string> = {
  xs: "text-[11px]",
  sm: "text-[13px]",
  lg: "text-[19px]",
};

const isSymbol = (children: ReactNode) =>
  typeof children === "string" && /^[^\w\s]$/u.test(children);

export const Keycap = ({ children, name, isPressed, size = "sm", className }: KeycapProps) => (
  <kbd
    className={cn(
      "inline-grid shrink-0 place-items-center border border-line-strong/30 border-b-line-strong/55 bg-surface font-sans font-medium leading-none text-ink-2",
      "transition-[transform,background-color,border-color,border-width,color] duration-100 motion-reduce:transition-none",
      SIZE_CLASS[size],
      isSymbol(children) && SYMBOL_SIZE_CLASS[size],
      isPressed &&
        "translate-y-px border-b border-primary/50 bg-primary/10 text-primary-text shadow-none",
      className,
    )}
  >
    <span aria-hidden={name ? true : undefined}>{children}</span>
    {name ? <span className="sr-only">{name}</span> : null}
  </kbd>
);
