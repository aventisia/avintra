import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";
import { ArrowsSplitIcon, PackageIcon, RepeatIcon } from "@phosphor-icons/react";
import type { ReactElement } from "react";

import { iconMapper } from "@/components/icon-mapper";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";

export type NodeLogIdentity = {
  /** Author-given step name, shown primary. */
  customName: string;
  /** Built-in step name, shown secondary when it differs from the custom name. */
  builtInName?: string;
  /** Step category, falling back to the stored names when absent. */
  category?: string;
  iconUrl?: string;
  icon?: string;
  img?: string;
};

const canvasFallbackIcons: Record<string, ReactElement> = {
  ConditionalNodeIcon: <ArrowsSplitIcon className="rotate-180" />,
  LoopNodeIcon: <RepeatIcon />,
  BlockNodeIcon: <PackageIcon />,
};

const isPresent = (value?: string) => !!value && value !== FALLBACK_VALUE;

/**
 * Step identity for a node-log header: canvas picture, custom name primary with the
 * built-in name secondary when they differ, and the category.
 */
export const NodeLogHeader = ({
  customName,
  builtInName,
  category,
  iconUrl,
  icon,
  img,
  className,
}: NodeLogIdentity & { className?: string }) => {
  const glyph = iconUrl ? (
    <NodeImage src={iconUrl} className="h-6 w-6" />
  ) : icon ? (
    (canvasFallbackIcons[icon] ?? iconMapper[icon] ?? <NodeImage src={img} className="h-6 w-6" />)
  ) : (
    <NodeImage src={img} className="h-6 w-6" />
  );

  const secondary = isPresent(builtInName) && builtInName !== customName ? builtInName : undefined;
  const detail = [secondary, category ?? (!secondary ? builtInName : undefined)]
    .filter(isPresent)
    .join(" · ");

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <span className="grid shrink-0 place-items-center text-muted-foreground">{glyph}</span>
      <span className="min-w-0">
        <span className="block truncate text-body-sm font-semibold text-ink">{customName}</span>
        {detail && detail !== customName && (
          <span className="block truncate text-xs text-muted-foreground">{detail}</span>
        )}
      </span>
    </div>
  );
};
