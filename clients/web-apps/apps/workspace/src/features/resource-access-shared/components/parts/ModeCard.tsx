import { cn } from "@avplatform/ui/lib";
import { Building2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

import type { AccessMode } from "../../types/access-mode.type";

type ModeCardProps = {
  mode: AccessMode;
  isChecked: boolean;
  title: string;
  description: string;
  onSelect: (mode: AccessMode) => void;
  autoFocusTarget?: boolean;
};

/**
 * Selectable card for one access mode in the open/restricted radio group.
 */
export const ModeCard = ({
  mode,
  isChecked,
  title,
  description,
  onSelect,
  autoFocusTarget = false,
}: ModeCardProps) => {
  const Icon = mode === "open" ? Building2 : ShieldCheck;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      tabIndex={isChecked ? 0 : -1}
      data-mode={mode}
      data-autofocus={autoFocusTarget || undefined}
      onClick={() => onSelect(mode)}
      className={cn(
        "flex flex-col gap-3 rounded-xl p-4 text-left outline-none transition-[background-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
        isChecked
          ? "bg-indigo-50/60 shadow-[0_8px_24px_-12px_rgba(79,70,229,0.45)] ring-[1.5px] ring-indigo-500"
          : "bg-popover ring-1 ring-border hover:bg-slate-50/80 hover:ring-slate-300",
      )}
    >
      <span className="flex items-center justify-between">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-[10px] ring-1",
            mode === "open"
              ? "bg-emerald-50 text-emerald-600 ring-emerald-600/15"
              : "bg-indigo-50 text-indigo-600 ring-indigo-600/15",
          )}
        >
          <Icon className="size-[18px]" />
        </span>
        <span
          className={cn(
            "grid size-[18px] place-items-center rounded-full transition-colors duration-200",
            isChecked ? "bg-primary" : "bg-popover shadow-[inset_0_0_0_1.5px_rgb(203,213,225)]",
          )}
        >
          <motion.span
            initial={false}
            animate={{ scale: isChecked ? 1 : 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.3 }}
            className="size-1.5 rounded-full bg-popover"
          />
        </span>
      </span>
      <span>
        <span className="block text-[14px] font-semibold text-slate-900">{title}</span>
        <span className="mt-1 block text-[12.5px] leading-[18px] text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
};
