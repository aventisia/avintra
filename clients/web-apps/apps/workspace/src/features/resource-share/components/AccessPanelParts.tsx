import { cn } from "@avplatform/ui/lib";
import { Building2, type LucideIcon, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { PANEL_TRANSITION } from "../constants/resource-flow-access.constant";

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
  <p className={cn("mt-2 flex items-center gap-1.5 text-[12px] text-amber-700", className)}>
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
  <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-white px-4 py-3.5 ring-1 ring-emerald-600/10">
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-popover text-emerald-600 shadow-sm ring-1 ring-emerald-600/15">
      <Building2 className="size-4" />
    </span>
    <div>
      <p className="text-[13px] font-semibold text-emerald-900">{title}</p>
      <p className="mt-0.5 text-[12.5px] leading-5 text-emerald-900/65">{description}</p>
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
  <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-slate-50/50 px-6 py-8 text-center">
    <span className="grid size-10 place-items-center rounded-full bg-popover text-indigo-500 shadow-sm ring-1 ring-border">
      <Icon className="size-5" />
    </span>
    <p className="mt-3 text-[13.5px] font-semibold text-slate-800">{title}</p>
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
    <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {title}
      <span className="rounded-full bg-muted px-1.5 py-px text-[11px] tabular-nums tracking-normal text-slate-600">
        {count}
      </span>
    </h3>
    {action}
  </div>
);
