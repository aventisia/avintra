import { cn } from "@avplatform/ui/lib";
import type { ReactNode } from "react";

import NewAgentIcon from "@/components/NewAgentIcon";

import { FolderColor } from "../../types/folder-color.type";
import { FolderGlyph } from "./FolderGlyph";

const SIZES = {
  xs: "size-5 rounded-md [&>svg]:size-3",
  sm: "size-7 rounded-lg [&>svg]:size-4",
  md: "size-10 rounded-xl [&>svg]:size-[22px]",
  lg: "size-12 rounded-2xl [&>svg]:size-7",
  xl: "size-14 rounded-[18px] [&>svg]:size-8",
} as const;

type MarkSize = keyof typeof SIZES;

type MarkTileProps = {
  size: MarkSize;
  className: string;
  children: ReactNode;
};

const MarkTile = ({ size, className, children }: MarkTileProps) => (
  <span
    aria-hidden="true"
    className={cn("grid shrink-0 place-items-center ring-1 ring-inset", SIZES[size], className)}
  >
    {children}
  </span>
);

type FolderMarkProps = {
  color: FolderColor;
  size?: MarkSize;
  className?: string;
};

/**
 * Folder glyph on a tile tinted with the folder's color.
 */
export const FolderMark = ({ color, size = "md", className }: FolderMarkProps) => (
  <MarkTile size={size} className={cn(color.tile, color.glyph, className)}>
    <FolderGlyph />
  </MarkTile>
);

/**
 * Tile for the top level of the Agents page, where agents outside any folder live.
 */
export const AgentsRootMark = ({ size = "md", className }: Omit<FolderMarkProps, "color">) => (
  <MarkTile size={size} className={cn("bg-slate-50 text-slate-500 ring-slate-900/10", className)}>
    <NewAgentIcon />
  </MarkTile>
);
