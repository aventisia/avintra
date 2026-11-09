import { cn } from "@avplatform/ui/lib";
import { CoinsIcon, WarningIcon } from "@phosphor-icons/react";

import { PlanDto } from "@/features/05-tenant-admin/tenant/dtos/current-plan-dto.ee";
import {
  formatCount,
  getBillingPeriod,
  isUnlimited,
} from "@/features/05-tenant-admin/tenant/utils/plan-display.util.ee";

/**
 * Credit balance with the plan's credit allowance.
 */
export const CreditsCard = ({ plan }: { plan: PlanDto }) => {
  const balance = plan.availableCredits;
  const allowance = plan.feature.maxCredits;
  const isNegative = balance < 0;

  return (
    <div className="overflow-hidden rounded-lg bg-surface ring-1 ring-line">
      <div className="relative px-4 pb-4 pt-3.5">
        <CoinsIcon
          aria-hidden="true"
          weight="duotone"
          className="pointer-events-none absolute -right-3 -top-2 size-24 text-primary opacity-[0.07]"
        />
        <p
          className={cn(
            "font-mono text-[34px] font-medium leading-10 tracking-[-0.03em] tabular-nums",
            isNegative ? "text-bad" : "text-ink",
          )}
        >
          {formatCount(balance)}
        </p>
        <p className="text-[12.5px] text-muted-foreground">credits available</p>
        {isNegative && (
          <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-bad">
            <WarningIcon className="size-3.5 shrink-0" />
            Your balance is below zero.
          </p>
        )}
      </div>
      <p className="flex items-center gap-2 border-t border-line bg-sunken/60 px-4 py-2.5 text-[12px] text-ink-2">
        <CoinsIcon className="size-3.5 shrink-0 text-muted-foreground" />
        {isUnlimited(allowance)
          ? "Unlimited credits on this plan"
          : `Plan includes ${formatCount(allowance)} credits / ${getBillingPeriod(plan.frequency)}`}
      </p>
    </div>
  );
};
