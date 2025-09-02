// components/PlanTab.tsx
import { Button } from "@aventisia/ui/buttons";
import { RadioGroup } from "@aventisia/ui/radio-group";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useShallow } from "zustand/react/shallow";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { useChoosePlanStore } from "../../stores/choose-plan-store";
import { PlanItem } from "./PlanItem";

type PlanTabProps = {
  data?: SubscriptionPlanDTO[];
  planType: "monthly" | "yearly";
};

export default function PlanTab({ data, planType }: PlanTabProps) {
  const { planId, setPlanId, setPlanType, setStepNo } = useChoosePlanStore(
    useShallow((state) => ({
      planId: state.planId,
      setPlanId: state.setPlanId,
      setPlanType: state.setPlanType,
      setStepNo: state.setStepNo,
    })),
  );

  const handleProceed = () => {
    if (planId) setStepNo(2);
  };

  return (
    <div>
      <ScrollArea className="h-[60vh] border rounded-lg p-2">
        <RadioGroup
          value={planId}
          onValueChange={(val) => {
            setPlanId(val);
            setPlanType(planType);
          }}
        >
          {data?.map((plan) => (
            <PlanItem
              key={plan.id}
              plan={plan}
              planType={planType}
              selectedId={planId}
            />
          ))}
        </RadioGroup>
      </ScrollArea>

      <div className="flex justify-end w-full">
        <Button className="mt-5" onClick={handleProceed} disabled={!planId}>
          Next
        </Button>
      </div>
    </div>
  );
}
