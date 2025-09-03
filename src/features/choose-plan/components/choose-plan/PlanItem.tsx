import CustomRadioItem from "@/components/ui/CustomRadioItem";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { getPlanPricing } from "../../utils/pricing";
import { PlanFeatures } from "./PlanFeatures";

type Props = {
  plan: SubscriptionPlanDTO;
  planType: "monthly" | "yearly";
  selectedId: string;
};

export const PlanItem = ({ plan, planType, selectedId }: Props) => {
  const { credits } = getPlanPricing(plan, planType);
  const isSelected = selectedId === plan.id;

  return (
    <CustomRadioItem
      value={plan.id}
      selected={selectedId}
      showRadioCircle
      className="flex flex-col items-start gap-4 p-4 pl-10"
      radioClassName="top-9 left-4"
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <h6 className="text-base font-medium">{plan.name}</h6>
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-1 items-baseline">
            <p className="text-lg">{credits}</p>
            <span className="text-sm text-muted-foreground">
              credits/{planType == "monthly" ? "month" : "year"}
            </span>
          </div>
          <div className="flex gap-1 items-baseline">
            <p className="text-lg">
              {planType == "monthly" ? (
                <> ${plan.monthlyPrice}</>
              ) : (
                <>
                  <span className="line-through text-sm">
                    {" "}
                    ${plan.monthlyPrice}
                  </span>
                  <span className="font-semibold"> ${plan.yearlyPrice}</span>
                </>
              )}
            </p>
            <span className="text-sm text-muted-foreground">/{"month"}</span>
          </div>
        </div>

        {isSelected && <PlanFeatures plan={plan} />}
      </div>
    </CustomRadioItem>
  );
};
