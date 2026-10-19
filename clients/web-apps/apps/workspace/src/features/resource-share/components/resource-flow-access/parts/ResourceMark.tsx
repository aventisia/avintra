import { cn } from "@avplatform/ui/lib";
import { useState } from "react";

import { ResourceTypeEnum } from "../../../enums/resource-type-enum";
import { FALLBACK_RESOURCE_ICON, getResourceIconSrc } from "../../../utils/resource-display.util";

interface ResourceMarkProps {
  resourceName: string;
  resourceType: ResourceTypeEnum | null;
  className?: string;
}

/**
 * Brand icon of the resource whose agent access is being configured.
 */
export const ResourceMark = ({ resourceName, resourceType, className }: ResourceMarkProps) => {
  const [hasFailed, setHasFailed] = useState(false);

  return (
    <img
      src={hasFailed ? FALLBACK_RESOURCE_ICON : getResourceIconSrc(resourceName, resourceType)}
      alt=""
      className={cn("object-contain", className)}
      onError={() => setHasFailed(true)}
    />
  );
};
