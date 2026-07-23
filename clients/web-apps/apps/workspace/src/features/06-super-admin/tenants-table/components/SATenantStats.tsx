import { StatsCard } from "@avplatform/ui/cards";
import { ClockIcon, CoinsIcon, UsersIcon } from "lucide-react";
import { Fragment, useMemo } from "react";

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
    const parts = Object.entries(obj).map(([plan, value]) => {
      if (options?.isTime) {
        return {
          plan,
          value: formatSecondsToCompactDuration(value),
        };
      }

      if (options?.isCredit) {
        return {
          plan,
          value: round2(value),
        };
      }

      return {
        plan,
        value,
      };
    });

    if (!parts.length) {
      return "No plan data available";
    }

    return (
      <>
        {parts.map((part, index) => (
          <Fragment key={part.plan}>
            {index > 0 && ", "}
            <span className="font-medium text-xs">{part.value}</span> {part.plan}
          </Fragment>
        ))}
      </>
    );
  };
  return (
    <div className="mb-2 grid grid-cols-3 gap-4">
      {/*  Total Tenants */}
      <StatsCard
        icon={<UsersIcon className="size-7" />}
        title="Total Tenants"
        content={stats.tenants}
        footer={formatBreakdown(stats.tenantsByPlan)}
      />

      {/*  Consumed Credits */}
      <StatsCard
        icon={<CoinsIcon className="size-7" />}
        title="Consumed Credits"
        content={round2(stats.consumedCredits)}
        footer={formatBreakdown(stats.creditsByPlan, { isCredit: true })}
      />

      {/*  Execution Time */}
      <StatsCard
        icon={<ClockIcon className="size-7" />}
        title="Execution Time"
        content={stats.executionLabel}
        footer={formatBreakdown(stats.executionByPlan, { isTime: true })}
      />
    </div>
  );
};
