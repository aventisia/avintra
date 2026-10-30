import { StatsCard } from "@avplatform/ui/cards";
import { BadgeCheckIcon, ClockIcon, UsersIcon } from "lucide-react";

import NewAgentIcon from "@/components/NewAgentIcon";
import { formatSecondsToCompactDuration } from "@/utils/format-time-utils";

import { useFetchTenantStatistics } from "../hooks/useFetchTenantStatistics.ee";
import { useTenantRoute } from "../hooks/useTenantRoute.ee";

export const TenantStats = () => {
  const { tid } = useTenantRoute();

  const { data } = useFetchTenantStatistics(tid || "");

  const formatNumber = (num: number) =>
    num?.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  return (
    <div className="mb-2 grid grid-cols-4 gap-4">
      <StatsCard
        key="Total Execution Time Consumed"
        icon={<ClockIcon className="size-6" />}
        title={"Total Execution Time Consumed"}
        content={formatSecondsToCompactDuration(data?.data.totalExecutionTimeConsumed ?? 0)}
      />
      <StatsCard
        key={"Total Users"}
        icon={<UsersIcon className="size-6" />}
        title={"Total Users"}
        content={formatNumber(data?.data.totalUsers ?? 0)}
      />
      <StatsCard
        key={"Total Published Agents"}
        icon={<NewAgentIcon className="size-6" />}
        title={"Total Published Agents"}
        content={formatNumber(data?.data.totalPublishedAgents ?? 0)}
      />
      <StatsCard
        key={"Total Executed Jobs"}
        icon={<BadgeCheckIcon className="size-6" />}
        title={"Total Executed Jobs"}
        content={formatNumber(data?.data.totalExecutedJobs ?? 0)}
      />
    </div>
  );
};
