import { type ReactNode } from "react";

type ToolPillProps = {
  children: ReactNode;
  "aria-label"?: string;
};

export const ToolPill = ({ children, ...props }: ToolPillProps) => (
  <span
    className="bg-sunken border border-line px-1 text-2xs leading-none h-[1.4rem] flex items-center justify-center text-ink-2 rounded-sm"
    {...props}
  >
    {children}
  </span>
);
