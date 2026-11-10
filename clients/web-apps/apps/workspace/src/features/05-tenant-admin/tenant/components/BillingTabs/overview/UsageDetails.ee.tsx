import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import type { IconProps } from "@avplatform/ui/types";
import { HardDrivesIcon, SquaresFourIcon } from "@phosphor-icons/react";
import type { ComponentType } from "react";

import NewAgentIcon from "@/components/NewAgentIcon";
import { PlanDto } from "@/features/05-tenant-admin/tenant/dtos/current-plan-dto.ee";
import { useFetchAgentsAndModelsCount } from "@/features/05-tenant-admin/tenant/hooks/useFetchAgentsAndModelsCount.ee";
import {
  formatCount,
  formatStorage,
  isUnlimited,
} from "@/features/05-tenant-admin/tenant/utils/plan-display.util.ee";

type UsageMeterProps = {
  Icon: ComponentType<IconProps>;
  label: string;
  used: number;
  limit: number;
  format?: (value: number) => string;
};

const getBarClass = (ratio: number) =>
  ratio >= 1 ? "bg-bad" : ratio >= 0.8 ? "bg-warn" : "bg-primary";

const UsageMeter = ({ Icon, label, used, limit, format = formatCount }: UsageMeterProps) => {
  const hasLimit = !isUnlimited(limit);
  const ratio = hasLimit ? Math.min(used / limit, 1) : 0;
  const caption = !hasLimit
    ? "No limit on this plan"
    : used >= limit
      ? "Limit reached"
      : `${format(limit - used)} left`;

  return (
    <div className="flex flex-col rounded-lg bg-surface p-4 ring-1 ring-line">
      <div className="flex items-center gap-2">
        <IconTile Icon={Icon} size="sm" />
        <span className="truncate text-[13px] font-medium text-ink">{label}</span>
        {hasLimit && (
          <span className="ml-auto font-mono text-[11.5px] tabular-nums text-muted-foreground">
            {Math.round(ratio * 100)}%
          </span>
        )}
      </div>
      <p className="mt-4 font-mono text-[22px] font-medium leading-7 tracking-[-0.02em] tabular-nums text-ink">
        {format(used)}
        <span className="ml-1 text-[13px] font-normal tracking-normal text-muted-foreground">
          / {hasLimit ? format(limit) : "∞"}
        </span>
      </p>
      <div
        role="progressbar"
        aria-label={`${label} used`}
        aria-valuemin={0}
        aria-valuemax={hasLimit ? limit : undefined}
        aria-valuenow={used}
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sunken ring-1 ring-inset ring-line"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", getBarClass(ratio))}
          style={{ width: `${used > 0 && hasLimit ? Math.max(ratio, 0.02) * 100 : 0}%` }}
        />
      </div>
      <p
        className={cn(
          "mt-2 text-[11.5px]",
          ratio >= 1 ? "font-medium text-bad" : "text-muted-foreground",
        )}
      >
        {caption}
      </p>
    </div>
  );
};

/**
 * Meters of what the tenant uses against the plan's limits.
 */
export const UsageDetails = ({ plan }: { plan: PlanDto }) => {
  const { agentsCount } = useFetchAgentsAndModelsCount();
  const spaces = plan.usage?.find((usage) => usage.resourceName === "Spaces");
  const storage = plan.usage?.find((usage) => usage.resourceName === "Storage");
  const showSpaces = !!spaces && import.meta.env.MODE !== "production";

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", showSpaces && "xl:grid-cols-3")}>
      <UsageMeter
        Icon={NewAgentIcon}
        label="Published agents"
        used={agentsCount}
        limit={plan.feature.maxPublishedItems}
      />
      {showSpaces && (
        <UsageMeter Icon={SquaresFourIcon} label="Spaces" used={spaces.used} limit={spaces.limit} />
      )}
      {storage && (
        <UsageMeter
          Icon={HardDrivesIcon}
          label="Storage"
          used={storage.used}
          limit={storage.limit}
          format={formatStorage}
        />
      )}
    </div>
  );
};
