import { BadgeCheckIcon, BotIcon, ClockIcon, UsersIcon } from "lucide-react";

import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

import { useFetchTenantStatistics } from "../hooks/useFetchTenantStatistics";
import { useTenantRoute } from "../hooks/useTenantRoute";

export const TenantStats = () => {
  const { tid } = useTenantRoute();

  const { data } = useFetchTenantStatistics(tid || "");
  return (
    <div className="mb-3 grid grid-cols-4 gap-3">
      <StatsCard
        key="Total Execution Time Consumed"
        title={"Total Execution Time Consumed"}
        mainText={data?.data.totalExecutionTimeConsumed ?? 0}
        icon={<ClockIcon stroke="var(--primary)" className="h-6 w-6" />}
      />
      <StatsCard
        title={"Total Users"}
        key={"Total Users"}
        mainText={data?.data.totalUsers ?? 0}
        icon={<UsersIcon stroke="var(--primary)" className="h-6 w-6" />}
      />
      <StatsCard
        title={"Total Published Agents"}
        key={"Total Published Agents"}
        mainText={data?.data.totalPublishedAgents ?? 0}
        icon={<BotIcon stroke="var(--primary)" className="h-6 w-6" />}
      />
      <StatsCard
        title={"Total Executed Jobs"}
        key={"Total Executed Jobs"}
        mainText={data?.data.totalExecutedJobs ?? 0}
        icon={<BadgeCheckIcon stroke="var(--primary)" className="h-6 w-6" />}
      />
    </div>
  );
};
