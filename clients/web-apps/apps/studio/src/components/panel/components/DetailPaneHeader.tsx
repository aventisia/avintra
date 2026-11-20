import { IconTile, type IconTileProps } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import type { ReactNode } from "react";

import { LEFT_DOCK_TITLE_CLASS } from "../left-dock-panel.constant";

type DetailPaneHeaderProps = {
  Icon: IconTileProps["Icon"];
  /** Mono caption above the title, such as a version or a timestamp. */
  eyebrow: ReactNode;
  title: string;
  /** Trailing content, such as a status badge. */
  aside?: ReactNode;
  className?: string;
};

/** Header of a detail pane: an icon tile, a mono eyebrow over the title, and optional trailing content. */
export const DetailPaneHeader = ({
  Icon,
  eyebrow,
  title,
  aside,
  className,
}: DetailPaneHeaderProps) => (
  <header
    className={cn("flex h-16 shrink-0 items-center gap-3 border-b border-line px-6", className)}
  >
    <IconTile Icon={Icon} />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-mono text-label uppercase text-muted-foreground">
        {eyebrow}
      </span>
      <h2 className={cn("truncate text-ink", LEFT_DOCK_TITLE_CLASS)} title={title}>
        {title}
      </h2>
    </div>
    {aside}
  </header>
);
