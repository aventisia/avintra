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

const TONES = {
  neutral: "bg-sunken text-ink-2 ring-line",
  primary:
    "bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))] text-[color-mix(in_srgb,var(--primary)_75%,var(--ink))] ring-[color-mix(in_srgb,var(--primary)_25%,transparent)]",
  teal: "bg-[color-mix(in_srgb,#0d9488_10%,var(--surface))] text-[color-mix(in_srgb,#0d9488_75%,var(--ink))] ring-[color-mix(in_srgb,#0d9488_25%,transparent)]",
  magenta:
    "bg-[color-mix(in_srgb,var(--ai-magenta-text)_10%,var(--surface))] text-[color-mix(in_srgb,var(--ai-magenta-text)_75%,var(--ink))] ring-[color-mix(in_srgb,var(--ai-magenta-text)_25%,transparent)]",
  sky: "bg-[color-mix(in_srgb,var(--ai-sky)_10%,var(--surface))] text-[color-mix(in_srgb,var(--ai-sky)_75%,var(--ink))] ring-[color-mix(in_srgb,var(--ai-sky)_25%,transparent)]",
} as const;

export type IconTileTone = keyof typeof TONES;

export type IconTileProps = {
  Icon: ComponentType<IconProps>;
  size?: keyof typeof SIZES;
  /** Hue of the tile; neutral sits on the sunken surface. */
  tone?: IconTileTone;
  className?: string;
};

/**
 * Square tile that frames an icon, neutral on the sunken surface or tinted by tone.
 */
export const IconTile = ({ Icon, size = "md", tone = "neutral", className }: IconTileProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-grid shrink-0 place-items-center ring-1 ring-inset",
      TONES[tone],
      SIZES[size],
      className,
    )}
  >
    <Icon />
  </span>
);
