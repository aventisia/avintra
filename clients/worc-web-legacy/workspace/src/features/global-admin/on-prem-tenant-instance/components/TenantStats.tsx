import NewAgentIcon from "@/components/NewAgentIcon";
import { formatSecondsToCompactDuration } from "@/features/orchestrator/jobs-table/utils";
import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

import { BadgeCheckIcon, ClockIcon, UsersIcon } from "lucide-react";

import { useFetchTenantStatistics } from "../hooks/useFetchTenantStatistics";
import { useTenantRoute } from "../hooks/useTenantRoute";

export const TenantStats = () => {
  const { tid } = useTenantRoute();

  const { data } = useFetchTenantStatistics(tid || "");

  const formatNumber = (num: number) =>
    num?.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  return (
    <div className="mb-3 grid grid-cols-4 gap-3">
      <StatsCard
        key="Total Execution Time Consumed"
        title={"Total Execution Time Consumed"}
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
