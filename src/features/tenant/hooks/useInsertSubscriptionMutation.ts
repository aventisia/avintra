import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { upgradePlan } from "../apis/tenant-subscription-apis";
import { useUpgradePlanDialogStore } from "../store/overview/upgrade-plan-dialog.store";

import { useRazorpayPayment } from "./useRazorpayPayment";

export const useInsertSubscriptionMutation = () => {
  const queryClient = useQueryClient();

  const { isRazorpayReady, openRazorpayPayment } = useRazorpayPayment();

  const { setOpen } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      setChosenPlan: state.setChosenPlan,
      setOpen: state.setOpen,
    })),
  );

  // Success handler function
  const handlePaymentSuccess = () => {
    toast.success("Plan Upgraded Successfully");
    //Invalidate current plan (Overview)
    queryClient.invalidateQueries({
      queryKey: ["CURRENT_PLAN"],
    });
  };

  // Failure handler function
  const handlePaymentFailure = () => {
    setOpen(false);
  };

  const { mutate: insertSubscriptionMutation, isPending } = useMutation({
    mutationFn: upgradePlan,

    onSuccess: async (res, variables) => {
      const { data } = res;

      // Paid Plan with Razorpay Subscription
      if (
        data.razorpaySubscriptionId &&
        variables.amount > 0 &&
        isRazorpayReady
      ) {
        setOpen(false);
        openRazorpayPayment({
          subscriptionId: data.razorpaySubscriptionId,
          onSuccess: handlePaymentSuccess,
          onFailure: handlePaymentFailure,
        });
        return;
      }
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { insertSubscriptionMutation, isPending };
};
