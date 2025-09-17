import CustomRadioItem from "@/components/ui/CustomRadioItem";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { PlanType } from "../../types/plan-type";
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

  const price =
    planType === "monthly" || plan.name == "Starter"
      ? plan.monthlyPrice
      : plan.yearlyPrice * 12;

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
            <p className="text-base">${price}</p>
            <span className="text-sm text-muted-foreground">/{timeUnit}</span>
          </div>
        </div>

        {isSelected && <PlanFeatures plan={plan} planType={planType} />}
      </div>
    </CustomRadioItem>
  );
};
