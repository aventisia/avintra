import { cn } from "@avplatform/ui/lib";

import { AgentAvatar } from "@/components/AgentAvatar";

import { MARK_SHADOW } from "../../constants/resource-share.constant";
import { ResourceTypeEnum } from "../../enums/resource-type-enum";
import { ResourceMark } from "../resource-flow-access/parts/ResourceMark";

/**
 * Dialog mark for the resource being shared.
 */
export const ShareMark = ({ resourceType }: { resourceType: ResourceTypeEnum | null }) =>
  resourceType === ResourceTypeEnum.Flow ? (
    <AgentAvatar size="lg" className={cn("size-12 rounded-2xl", MARK_SHADOW, "[&>svg]:size-6")} />
  ) : (
    <span
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-slate-50",
        MARK_SHADOW,
      )}
    >
      <ResourceMark resourceType={resourceType} className="size-6" />
    </span>
  );
