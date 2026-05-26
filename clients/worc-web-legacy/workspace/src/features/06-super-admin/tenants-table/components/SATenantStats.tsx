import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

import { ClockIcon, CoinsIcon, UsersIcon } from "lucide-react";
import { useMemo } from "react";

import { TenantsTableDto } from "../dtos/tenants-table-dto";
import { formatSecondsToCompactDuration, round2 } from "../utils";

interface StatsProps {
  data: TenantsTableDto[];
}

type PlanKey = string; // supports dynamic plans

export const SATenantStats = ({ data }: StatsProps) => {
  const stats = useMemo(() => {
    if (!data?.length) {
      return {
        tenants: 0,
        consumedCredits: 0,
        executionLabel: "0 sec",
        tenantsByPlan: {},
        creditsByPlan: {},
        executionByPlan: {},
      };
    }

    const tenants = data.length;

    const tenantsByPlan: Record<PlanKey, number> = {};
    const creditsByPlan: Record<PlanKey, number> = {};
    const executionByPlan: Record<PlanKey, number> = {};

    let consumedCredits = 0;
    let totalExecutionSeconds = 0;

    data.forEach((x) => {
      const plan = x.activePlan ?? "Unknown";

      //  tenants count
      tenantsByPlan[plan] = (tenantsByPlan[plan] ?? 0) + 1;

      //  credits
      const credits = x.consumedCredits ?? 0;
      consumedCredits += credits;
      creditsByPlan[plan] = (creditsByPlan[plan] ?? 0) + credits;

      //  execution
      const exec = x.totalExecutionTime ?? 0;
      totalExecutionSeconds += exec;
      executionByPlan[plan] = (executionByPlan[plan] ?? 0) + exec;
    });

    return {
      tenants,
      consumedCredits,
      executionLabel: formatSecondsToCompactDuration(totalExecutionSeconds),
      tenantsByPlan,
      creditsByPlan,
      executionByPlan,
    };
  }, [data]);

  //  helper to render breakdown
  const formatBreakdown = (
    obj: Record<string, number>,
    options?: { isTime?: boolean; isCredit?: boolean },
  ) => {
    return Object.entries(obj)
      .map(([plan, value]) => {
        if (options?.isTime) {
          return `${plan}: ${formatSecondsToCompactDuration(value)}`;
        }

        if (options?.isCredit) {
          return `${plan}: ${round2(value)}`;
        }

        return `${plan}: ${value}`; // normal (users, tenants)
      })
      .join(" | ");
  };
  return (
    <div className="my-4 grid grid-cols-3 gap-3">
      {/*  Total Tenants */}
      <StatsCard
        title="Total Tenants"
        mainText={stats.tenants}
        description={formatBreakdown(stats.tenantsByPlan)}
        icon={<UsersIcon stroke="var(--primary)" className="h-10 w-10" />}
      />

      {/*  Consumed Credits */}
      <StatsCard
        title="Consumed Credits"
        mainText={round2(stats.consumedCredits)}
        description={formatBreakdown(stats.creditsByPlan, { isCredit: true })}
        icon={<CoinsIcon stroke="var(--primary)" className="h-10 w-10" />}
      />

      {/*  Execution Time */}
      <StatsCard
        title="Execution Time"
        mainText={stats.executionLabel}
        description={formatBreakdown(stats.executionByPlan, { isTime: true })}
        icon={<ClockIcon stroke="var(--primary)" className="h-10 w-10" />}
      />
    </div>
  );
};
