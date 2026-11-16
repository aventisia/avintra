import { Label } from "@avplatform/ui/label";
import { cn } from "@avplatform/ui/lib";
import { RadioGroupItem } from "@avplatform/ui/radio-group";

import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map.ee";
import { SubscriptionPlanDTO } from "@/features/05-tenant-admin/tenant/dtos/subscription-plans-dto.ee";
import { PlanFrequency } from "@/features/05-tenant-admin/tenant/types/plan-type.ee";

import { PlanFeatures } from "../../PlanFeatures.ee";

type Props = {
  plan: SubscriptionPlanDTO;
  planFrequency: PlanFrequency;
  selectedId: string;
};

export const PlanItem = ({ plan, planFrequency, selectedId }: Props) => {
  const isSelected = selectedId === plan.id;
  const timeUnit = planFrequency === "monthly" || plan.name == "Starter" ? "month" : "year";

  return (
    <Label
      htmlFor={plan.id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg bg-surface p-4 font-normal ring-1 transition-[box-shadow,background-color]",
        isSelected ? "bg-selected/40 ring-2 ring-primary" : "ring-line hover:ring-line-strong",
      )}
    >
      <RadioGroupItem value={plan.id} id={plan.id} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[13.5px] font-semibold text-ink">{plan.name}</span>
          <span className="shrink-0 font-mono text-[15px] font-medium tabular-nums text-ink">
            {formatCurrency(plan.price ?? 0, plan.currency)}
            <span className="ml-1 font-sans text-[12px] font-normal text-muted-foreground">
              / {timeUnit}
            </span>
          </span>
        </div>

        {isSelected && (
          <PlanFeatures
            className="mt-3 border-t border-line pt-3"
            frequency={plan.frequency}
            credits={plan.maxCredits}
            publishedItems={plan.maxPublishedItems}
            historyRetentionDays={plan.historyRetentionDays}
            spaces={plan.maxSpaces}
            storageLimitMB={plan.storageLimitMB}
            users={plan.maxUsers}
          />
        )}
      </div>
    </Label>
  );
};
