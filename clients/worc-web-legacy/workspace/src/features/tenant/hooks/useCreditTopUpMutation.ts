import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { insertCreditTopUp } from "../apis/credit-top-up-apis";
import { useUpgradePlanDialogStore } from "../store/overview/upgrade-plan-dialog.store";

import { useRazorpayPayment } from "./useRazorpayPayment";

export const useCreditTopUpMutation = () => {
  const { isRazorpayReady, openRazorpayPayment } = useRazorpayPayment();

  const { setOpen, resetToDefault } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      resetToDefault: state.resetToDefault,
      setOpen: state.setOpen,
    })),
  );

  // Success handler function
  const handlePaymentSuccess = () => {};

  // Failure handler function
  const handlePaymentFailure = () => {
    setOpen(false);
  };

  const { mutate: insertCreditTopUpMutation, isPending } = useMutation({
    mutationFn: insertCreditTopUp,

    onSuccess: async (res, variables) => {
      const { data } = res;

      // Paid Plan with Razorpay Subscription
      if (data?.razorpayId && variables.amount > 0 && isRazorpayReady) {
        resetToDefault();
        setOpen(false);
        openRazorpayPayment({
          orderId: data.razorpayId,
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

  return { insertCreditTopUpMutation, isPending };
};
