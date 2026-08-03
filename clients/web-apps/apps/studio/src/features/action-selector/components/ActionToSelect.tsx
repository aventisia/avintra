import { Badge } from "@avplatform/ui/badge";
import { MonitorIcon } from "lucide-react";

import { iconMapper } from "@/components/icon-mapper";
import { NodeDataType } from "@/types/node-data-type";

import { FallbackImageIcon } from "./FallbackImageIcon";

interface ActionToSelectProps {
  data: NodeDataType;
}

export const ActionToSelect = ({ data }: ActionToSelectProps) => {
  return (
    <div className="relative grid w-full grid-cols-[auto_1fr] items-center gap-3 px-2 py-2">
      {data.supportedPlatforms?.length === 1 && data.supportedPlatforms?.includes("windows") ? (
        <MonitorIcon
          className="absolute right-4 top-4 h-2.5 w-2.5 text-muted-foreground"
          aria-hidden="true"
        />
      ) : null}

      {data.icon ? (
        <div aria-hidden="true">{iconMapper[data.icon]}</div>
      ) : (
        <FallbackImageIcon className="h-4 w-4" src={data.img} aria-hidden="true" />
      )}

      <div className="grow space-y-0.5">
        <h2 className="flex items-center text-xs font-medium text-foreground">
          {data.label}{" "}
          {data.disabled && (
            <Badge className="ml-1 text-3xs" variant={"outline"}>
              Coming soon
            </Badge>
          )}
        </h2>
        <p className="text-2xs text-muted-foreground line-clamp-2" title={data.description}>
          {data.description}
        </p>
      </div>
    </div>
  );
};
