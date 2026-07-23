import CustomRadioItem from "@/components/CustomRadioItem";
import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map";
import { SubscriptionPlanDTO } from "@/features/05-tenant-admin/tenant/dtos/subscription-plans-dto";
import { PlanFrequency } from "@/features/05-tenant-admin/tenant/types/plan-type";

import { PlanFeatures } from "../../PlanFeatures";

type Props = {
  plan: SubscriptionPlanDTO;
  planFrequency: PlanFrequency;
  selectedId: string;
  highlightSelected?: boolean;
};

export const PlanItem = ({ plan, planFrequency, selectedId, highlightSelected = true }: Props) => {
  const isSelected = selectedId === plan.id;
  const timeUnit = planFrequency === "monthly" || plan.name == "Starter" ? "month" : "year";

  return (
    <CustomRadioItem
      value={plan.id}
      selected={selectedId}
      showRadioCircle
      highlightSelected={highlightSelected}
      className="flex flex-col items-start gap-4 p-4 pl-10"
      radioClassName="top-[1.375rem] left-4 "
    >
      <div className="flex w-full flex-col items-start gap-2">
        <div className="flex w-full items-center justify-between">
          <h6 className="text-base font-medium">{plan.name}</h6>

          <div className="flex items-baseline gap-1">
            <p className="text-base">{formatCurrency(plan.price ?? 0, plan.currency)}</p>
            <span className="text-sm text-muted-foreground">/{timeUnit}</span>
          </div>
        </div>

        {isSelected && (
          <PlanFeatures
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
    </CustomRadioItem>
  );
};
