import { RadioGroup } from "@aventisia/ui/radio-group";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { PlanFrequency } from "../../types/plan-type";
import { PlanItem } from "../choose-plan/PlanItem";

const SelectedPlan = ({
  plan,
  planFrequency,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planFrequency: PlanFrequency;
}) => {
  return (
    <RadioGroup value={plan?.id}>
      {plan && (
        <PlanItem
          plan={plan}
          planFrequency={planFrequency}
          selectedId={plan.id}
          highlightSelected={false}
        />
      )}
    </RadioGroup>
  );
};

export default SelectedPlan;
