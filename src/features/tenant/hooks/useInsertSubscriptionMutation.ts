import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { upgradePlan } from "../apis/tenant-subscription-apis";
import { useUpgradePlanDialogStore } from "../store/overview/upgrade-plan-dialog.store";

import { useRazorpayPayment } from "./useRazorpayPayment";

export const useInsertSubscriptionMutation = () => {
  const { isRazorpayReady, openRazorpayPayment } = useRazorpayPayment();

  const { setOpen, resetToDefault } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      resetToDefault: state.resetToDefault,
      setOpen: state.setOpen,
    })),
  );

  // Success handler function
  const handlePaymentSuccess = () => {
    toast.success("Plan Upgraded Successfully");
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
      if (data.razorpayOrderId && variables.amount > 0 && isRazorpayReady) {
        resetToDefault();
        setOpen(false);
        openRazorpayPayment({
          orderId: data.razorpayOrderId,
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
