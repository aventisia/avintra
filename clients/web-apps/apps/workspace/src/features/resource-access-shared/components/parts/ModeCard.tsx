import {
  OPTION_CARD,
  OPTION_CARD_FOCUS,
  OPTION_CARD_IDLE,
  OPTION_CARD_SELECTED,
  cn,
} from "@avplatform/ui/lib";
import { BuildingsIcon, ShieldCheckIcon } from "@phosphor-icons/react";
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
  const Icon = mode === "open" ? BuildingsIcon : ShieldCheckIcon;

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
        OPTION_CARD,
        OPTION_CARD_FOCUS,
        "flex flex-col gap-3 p-4 text-left",
        isChecked ? OPTION_CARD_SELECTED : OPTION_CARD_IDLE,
      )}
    >
      <span className="flex items-center justify-between">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-md bg-sunken text-ink-2 ring-1 ring-line",
            isChecked && "text-primary-text",
          )}
        >
          <Icon className="size-[18px]" />
        </span>
        <span
          className={cn(
            "grid size-[18px] place-items-center rounded-full transition-colors duration-200",
            isChecked ? "bg-focus" : "bg-surface ring-[1.5px] ring-inset ring-line-field",
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
        <span className="block text-[14px] font-semibold text-ink">{title}</span>
        <span className="mt-1 block text-[12.5px] leading-[18px] text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
};
