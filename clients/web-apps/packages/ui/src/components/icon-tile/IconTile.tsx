import type { ComponentType } from "react";

import { cn } from "@/ui/lib";
import { type IconProps } from "@/ui/types";

const SIZES = {
  xs: "size-6 rounded-sm [&>svg]:size-3.5",
  sm: "size-7 rounded-md [&>svg]:size-4",
  md: "size-8 rounded-md [&>svg]:size-[18px]",
  lg: "size-9 rounded-md [&>svg]:size-5",
  xl: "size-10 rounded-lg [&>svg]:size-[22px]",
} as const;

export type IconTileProps = {
  Icon: ComponentType<IconProps>;
  size?: keyof typeof SIZES;
  className?: string;
};

/**
 * Square tile that frames an icon on the sunken surface.
 */
export const IconTile = ({ Icon, size = "md", className }: IconTileProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-grid shrink-0 place-items-center bg-sunken text-ink-2 ring-1 ring-inset ring-line",
      SIZES[size],
      className,
    )}
  >
    <Icon />
  </span>
);
