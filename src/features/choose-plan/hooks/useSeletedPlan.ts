import { useShallow } from "zustand/react/shallow";

import { useChoosePlanStore } from "../stores/choose-plan-store";
import { useFetchSubscriptionPlans } from "./useFetchSubscriptionPlans";

export const useSelectedPlan = () => {
  const { planId, planType } = useChoosePlanStore(
    useShallow((state) => ({
      planId: state.planId,
      planType: state.planType,
    })),
  );
  // Get query client
  const { data: plansData } = useFetchSubscriptionPlans("Pro");

  // Get config data by id
  const planData = plansData?.data.find((item) => item?.id === planId);

  return { planData, planType };
};
