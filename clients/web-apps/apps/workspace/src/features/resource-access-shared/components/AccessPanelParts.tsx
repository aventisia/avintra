import { cn } from "@avplatform/ui/lib";
import { Building2, type LucideIcon, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { PANEL_TRANSITION } from "../constants/access-ui.constant";

type AnimatedPanelProps = {
  children: ReactNode;
};

/**
 * Height-animated panel swapped below an access mode radio group.
 */
export const AnimatedPanel = ({ children }: AnimatedPanelProps) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={PANEL_TRANSITION}
    className="-mx-1 overflow-hidden px-1"
  >
    {children}
  </motion.div>
);

type WarningLineProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Inline warning under an access panel.
 */
export const WarningLine = ({ children, className }: WarningLineProps) => (
  <p className={cn("mt-2 flex items-center gap-1.5 text-[12px] text-warn", className)}>
    <TriangleAlert className="size-3.5 shrink-0" />
    {children}
  </p>
);

type OpenAccessCalloutProps = {
  title: string;
  description: ReactNode;
};

/**
 * Callout shown while a resource is open to everyone.
 */
export const OpenAccessCallout = ({ title, description }: OpenAccessCalloutProps) => (
  <div className="flex items-start gap-3 rounded-lg bg-sunken px-4 py-3.5 ring-1 ring-line">
    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface text-ink-2 ring-1 ring-line">
      <Building2 className="size-4" />
    </span>
    <div>
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      <p className="mt-0.5 text-[12.5px] leading-5 text-ink-2">{description}</p>
    </div>
  </div>
);

type AccessEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
};

/**
 * Dashed empty card for an access list without rows.
 */
export const AccessEmptyState = ({ icon: Icon, title, description }: AccessEmptyStateProps) => (
  <div className="flex flex-col items-center rounded-lg border border-dashed border-line bg-sunken px-6 py-8 text-center">
    <span className="grid size-10 place-items-center rounded-md bg-surface text-ink-2 ring-1 ring-line">
      <Icon className="size-5" />
    </span>
    <p className="mt-3 text-[13.5px] font-semibold text-ink">{title}</p>
    <p className="mt-1 max-w-[18rem] text-[12.5px] leading-5 text-muted-foreground">
      {description}
    </p>
  </div>
);

type PanelHeadingProps = {
  title: string;
  count: number;
  action?: ReactNode;
};

/**
 * Access list heading with a count badge and an optional action.
 */
export const PanelHeading = ({ title, count, action }: PanelHeadingProps) => (
  <div className="mb-2 mt-5 flex items-center justify-between">
    <h3 className="flex items-center gap-2 font-mono text-label uppercase text-muted-foreground">
      {title}
      <span className="rounded-sm bg-sunken px-1.5 py-px font-mono text-[11px] tabular-nums tracking-normal text-ink-2">
        {count}
      </span>
    </h3>
    {action}
  </div>
);
