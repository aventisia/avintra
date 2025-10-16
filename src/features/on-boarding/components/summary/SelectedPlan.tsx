import { RadioGroup } from "@aventisia/ui/radio-group";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { PlanType } from "../../types/plan-type";
import { PlanItem } from "../choose-plan/PlanItem";

const SelectedPlan = ({
  plan,
  planType,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planType: PlanType;
}) => {
  return (
    <RadioGroup value={plan?.id}>
      {plan && (
        <PlanItem
          plan={plan}
          planType={planType}
          selectedId={plan.id}
          highlightSelected={false}
        />
      )}
    </RadioGroup>
  );
};

export default SelectedPlan;
