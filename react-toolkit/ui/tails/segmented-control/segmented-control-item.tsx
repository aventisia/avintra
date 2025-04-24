import { cva } from "class-variance-authority";
import { ReactNode } from "react";

import { cn } from "@/react-toolkit/lib/utils";

import { Button, ButtonProps } from "../button";
import { Tooltip, TooltipProps } from "../tooltip";

const segmentedControlItemVariants = cva("h-7 text-slate-950", {
  variants: {
    isActive: {
      true: "w-full rounded-md bg-white px-3 drop-shadow sm:w-auto",
      false: "w-full bg-transparent px-3 text-slate-600 sm:w-auto",
    },
  },
});

export interface SegmentedControlItemProps
  extends Omit<ButtonProps, "onChange" | "children"> {
  /** If true, the item will be disabled. */
  disabled?: boolean;
  /** @ignore */
  isActive: boolean;
  /** Tooltip props to display when the item is hovered. */
  tooltip?: TooltipProps;
  /** Value of the item. */
  value: string;
  /** Label of the item. */
  label: ReactNode;
  /** Callback when the item is clicked. */
  onChange?: (value: SegmentedControlItemProps["value"]) => void;
}

export function SegmentedControlItem({
  isActive,
  label,
  value,
  tooltip,
  onClick,
  onChange,
  ...buttonProps
}: SegmentedControlItemProps) {
  const root = (
    <Button
      size="small"
      variant="text"
      className={cn(segmentedControlItemVariants({ isActive }))}
      onClick={(e) => {
        onClick?.(e);
        onChange?.(value);
      }}
      {...buttonProps}
    >
      {label}
    </Button>
  );

  return tooltip ? (
    <Tooltip
      {...tooltip}
      containerClassName={cn(tooltip.containerClassName, "w-full sm:w-auto")}
    >
      {root}
    </Tooltip>
  ) : (
    root
  );
}

SegmentedControlItem.displayName = "SegmentedControlItem";
