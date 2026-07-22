import { RadioGroup } from "@avplatform/ui/radio-group";

import type { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import type { PlanFrequency } from "../../types/plan-type";
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
