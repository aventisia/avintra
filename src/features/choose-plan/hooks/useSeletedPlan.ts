import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";
import { useChoosePlanStore } from "../stores/choose-plan-store";

export const useSelectedPlan = () => {
  const { planId, planType } = useChoosePlanStore(
    useShallow((state) => ({
      planId: state.planId,
      planType: state.planType,
    })),
  );
  // Get query client
  const queryClient = useQueryClient();
  const plansData = queryClient.getQueryData<{
    data: SubscriptionPlanDTO[];
  }>(["SUBSCRIPTION_PLANS"]);

  // Get config data by id
  const planData = plansData?.data.find((item) => item?.id === planId);

  return { planData, planType };
};
