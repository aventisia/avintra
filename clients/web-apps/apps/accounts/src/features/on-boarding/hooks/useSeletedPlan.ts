import { useShallow } from "zustand/react/shallow";

import { useChoosePlanStore } from "../stores/choose-plan-store";
import { useFetchSubscriptionPlans } from "./useFetchSubscriptionPlans";

export const useSelectedPlan = () => {
  const { planId, planFrequency } = useChoosePlanStore(
    useShallow((state) => ({
      planId: state.planId,
      planFrequency: state.planFrequency,
    })),
  );
  // Get query client
  const { data: plansData } = useFetchSubscriptionPlans();

  // Get config data by id
  const planData = plansData?.data.find((item) => item?.id === planId);

  return { planData, planFrequency };
};
