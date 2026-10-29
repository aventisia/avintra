import { StatsCard } from "@avplatform/ui/cards";
import { BadgeCheckIcon, ClockIcon, UsersIcon } from "lucide-react";

import NewAgentIcon from "@/components/NewAgentIcon";
import { formatSecondsToCompactDuration } from "@/features/03-orchestrator/jobs-table/utils/format-time-utils";

import { useTenantRoute } from "../../on-prem-tenant-instance/hooks/useTenantRoute.ee";
import { formatNumber } from "../constants";
import { useFetchTenantInstanceStatistics } from "../hooks/useFetchTenantInstanceStatistics.ee";

export const TenantInstanceStats = () => {
  const { id } = useTenantRoute();

  const { data } = useFetchTenantInstanceStatistics(id || "");
  return (
    <div className="mb-2 grid grid-cols-4 gap-4">
      <StatsCard
        key="Total Execution Time"
        icon={<ClockIcon stroke="var(--primary)" className="h-6 w-6" />}
        title={"Total Execution Time"}
        content={formatSecondsToCompactDuration(data?.data.totalExecutionTimeConsumed ?? 0)}
      />
      <StatsCard
        key={"Total Users"}
        icon={<UsersIcon stroke="var(--primary)" className="h-6 w-6" />}
        title={"Total Users"}
        content={formatNumber(data?.data.totalUsers ?? 0)}
      />
      <StatsCard
        key={"Total Published Agents"}
        icon={<NewAgentIcon className="h-6 w-6 text-primary" />}
        title={"Total Published Agents"}
        content={formatNumber(data?.data.totalPublishedAgents ?? 0)}
      />
      <StatsCard
        key={"Total Executed Jobs"}
        icon={<BadgeCheckIcon stroke="var(--primary)" className="h-6 w-6" />}
        title={"Total Executed Jobs"}
        content={formatNumber(data?.data.totalExecutedJobs ?? 0)}
      />
    </div>
  );
};
