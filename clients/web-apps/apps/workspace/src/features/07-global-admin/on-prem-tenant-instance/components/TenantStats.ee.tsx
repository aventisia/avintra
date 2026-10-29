import { StatsCard } from "@avplatform/ui/cards";
import { BadgeCheckIcon, ClockIcon, UsersIcon } from "lucide-react";

import NewAgentIcon from "@/components/NewAgentIcon";
import { formatSecondsToCompactDuration } from "@/features/03-orchestrator/jobs-table/utils/format-time-utils";

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
        title={"Total execution time consumed"}
        content={formatSecondsToCompactDuration(data?.data.totalExecutionTimeConsumed ?? 0)}
      />
      <StatsCard
        key={"Total Users"}
        icon={<UsersIcon className="size-6" />}
        title={"Total users"}
        content={formatNumber(data?.data.totalUsers ?? 0)}
      />
      <StatsCard
        key={"Total Published Agents"}
        icon={<NewAgentIcon className="size-6" />}
        title={"Total published agents"}
        content={formatNumber(data?.data.totalPublishedAgents ?? 0)}
      />
      <StatsCard
        key={"Total Executed Jobs"}
        icon={<BadgeCheckIcon className="size-6" />}
        title={"Total executed jobs"}
        content={formatNumber(data?.data.totalExecutedJobs ?? 0)}
      />
    </div>
  );
};
