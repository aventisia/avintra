import { RecordFact, RecordFactGrid, RecordSummary } from "@avplatform/ui/record-sheet";
import {
  ClockCounterClockwiseIcon,
  CoinsIcon,
  HardDrivesIcon,
  RobotIcon,
  SquaresFourIcon,
  UsersIcon,
} from "@phosphor-icons/react";

import { PlanDto } from "@/features/05-tenant-admin/tenant/dtos/current-plan-dto.ee";
import {
  formatCount,
  formatStorage,
  getBillingPeriod,
  isUnlimited,
} from "@/features/05-tenant-admin/tenant/utils/plan-display.util.ee";

const limitLabel = (limit: number, format: (value: number) => string = formatCount) =>
  isUnlimited(limit) ? "Unlimited" : format(limit);

/**
 * Grid of the limits and allowances the current plan includes.
 */
export const PlanAllowances = ({ plan }: { plan: PlanDto }) => {
  const { feature } = plan;

  return (
    <RecordSummary>
      <RecordFactGrid>
        <RecordFact
          Icon={CoinsIcon}
          label="Credits"
          value={
            isUnlimited(feature.maxCredits)
              ? "Unlimited"
              : `${formatCount(feature.maxCredits)} / ${getBillingPeriod(plan.frequency)}`
          }
        />
        <RecordFact
          Icon={RobotIcon}
          label="Published agents"
          value={limitLabel(feature.maxPublishedItems)}
        />
        <RecordFact
          Icon={ClockCounterClockwiseIcon}
          label="History retention"
          value={limitLabel(feature.historyRetentionDays, (days) => `${formatCount(days)} days`)}
        />
        <RecordFact Icon={UsersIcon} label="Users" value={limitLabel(feature.maxUsers)} />
        <RecordFact
          Icon={HardDrivesIcon}
          label="Storage"
          value={limitLabel(feature.storageLimitMB, formatStorage)}
        />
        {import.meta.env.MODE !== "production" && (
          <RecordFact Icon={SquaresFourIcon} label="Spaces" value={limitLabel(feature.maxSpaces)} />
        )}
      </RecordFactGrid>
    </RecordSummary>
  );
};
