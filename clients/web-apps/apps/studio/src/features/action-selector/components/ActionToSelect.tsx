import { Badge } from "@avplatform/ui/badge";
import { MonitorIcon } from "@phosphor-icons/react";

import { iconMapper } from "@/components/icon-mapper";
import { NodeDataType } from "@/types/node-data-type";

import { useNodeSelectorStore } from "../stores/action-selector-store";
import { FallbackImageIcon } from "./FallbackImageIcon";
import { HighlightMatch } from "./HighlightMatch";

interface ActionToSelectProps {
  data: NodeDataType;
}

export const ActionToSelect = ({ data }: ActionToSelectProps) => {
  const query = useNodeSelectorStore((state) => state.query);

  return (
    <div className="flex h-9 w-full items-center gap-2.5 px-1.5">
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-sm border border-line bg-sunken text-ink-2 [&_img]:size-3.5 [&_svg]:size-3.5 [&_svg]:text-ink-2"
      >
        {data.iconUrl ? (
          <FallbackImageIcon className="h-3.5 w-3.5" src={data.iconUrl} />
        ) : data.icon ? (
          iconMapper[data.icon]
        ) : (
          <FallbackImageIcon className="h-3.5 w-3.5" src={data.img} />
        )}
      </span>

      <span className="min-w-0 truncate text-[13.5px]/5 font-medium text-ink">
        <HighlightMatch text={data.label} query={query} />
      </span>
      {data.badge && <Badge variant="primary">{data.badge}</Badge>}
      {data.isVerified === false && <Badge variant="review">Unverified</Badge>}
      {data.disabled && data.isVerified !== false && <Badge variant="outline">Coming soon</Badge>}

      {data.supportedPlatforms?.length === 1 && data.supportedPlatforms?.includes("windows") ? (
        <MonitorIcon
          className="ml-auto size-3 shrink-0 text-muted-foreground"
          aria-label="Windows only"
        />
      ) : null}
    </div>
  );
};
