import { BadgeCheckIcon, ClockIcon, UsersIcon } from "lucide-react";

import NewAgentIcon from "@/components/NewAgentIcon";
import { formatSecondsToCompactDuration } from "@/features/03-orchestrator/jobs-table/utils/format-time-utils";
import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

import { useTenantRoute } from "../../on-prem-tenant-instance/hooks/useTenantRoute";
import { formatNumber } from "../constants";
import { useFetchTenantInstanceStatistics } from "../hooks/useFetchTenantInstanceStatistics";

export const TenantInstanceStats = () => {
  const { id } = useTenantRoute();

  const { data } = useFetchTenantInstanceStatistics(id || "");
  return (
    <div className="mb-3 grid grid-cols-4 gap-3">
      <StatsCard
        key="Total Execution Time"
        title={"Total Execution Time"}
        mainText={formatSecondsToCompactDuration(
          data?.data.totalExecutionTimeConsumed ?? 0,
        )}
        icon={<ClockIcon stroke="var(--primary)" className="h-6 w-6" />}
      />
      <StatsCard
        title={"Total Users"}
        key={"Total Users"}
        mainText={formatNumber(data?.data.totalUsers ?? 0)}
        icon={<UsersIcon stroke="var(--primary)" className="h-6 w-6" />}
      />
      <StatsCard
        title={"Total Published Agents"}
        key={"Total Published Agents"}
        mainText={formatNumber(data?.data.totalPublishedAgents ?? 0)}
        icon={<NewAgentIcon className="h-6 w-6 text-primary" />}
      />
      <StatsCard
        title={"Total Executed Jobs"}
        key={"Total Executed Jobs"}
        mainText={formatNumber(data?.data.totalExecutedJobs ?? 0)}
        icon={<BadgeCheckIcon stroke="var(--primary)" className="h-6 w-6" />}
      />
    </div>
  );
};
