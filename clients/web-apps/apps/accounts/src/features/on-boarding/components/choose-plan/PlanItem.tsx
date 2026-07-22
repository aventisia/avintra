import CustomRadioItem from "@/components/ui/CustomRadioItem";

import { formatCurrency } from "../../constants/currency-symbol-map";
import type { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import type { PlanFrequency } from "../../types/plan-type";
import { PlanFeatures } from "./PlanFeatures";

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
      className="flex flex-col items-start gap-4  p-4 pl-10"
      radioClassName="top-[1.375rem] left-4 "
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex justify-between items-center w-full">
          <h6 className="text-base font-medium ">{plan.name}</h6>

          <div className="flex gap-1 items-baseline">
            <p className="text-base">{formatCurrency(plan.price, plan.currency)}</p>
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
