import CustomRadioItem from "@/components/CustomRadioItem";
import { SubscriptionPlanDTO } from "@/features/tenant/dtos/subscription-plans-dto";
import { PlanType } from "@/features/tenant/types/plan-type";

import { PlanFeatures } from "./PlanFeatures";

type Props = {
  plan: SubscriptionPlanDTO;
  planType: PlanType;
  selectedId: string;
  highlightSelected?: boolean;
};

export const PlanItem = ({
  plan,
  planType,
  selectedId,
  highlightSelected = true,
}: Props) => {
  const isSelected = selectedId === plan.id;
  const timeUnit =
    planType === "monthly" || plan.name == "Starter" ? "month" : "year";

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
            <p className="text-base">${plan.price}</p>
            <span className="text-sm text-muted-foreground">/{timeUnit}</span>
          </div>
        </div>

        {isSelected && <PlanFeatures plan={plan} planType={planType} />}
      </div>
    </CustomRadioItem>
  );
};
