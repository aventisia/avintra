import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { purchasePlan } from "../apis/tenant-subscription-apis";
import { useRazorpayPayment } from "./useRazorpayPayment";

export const useInsertSubscriptionMutation = () => {
  const navigate = useNavigate();

  const { isRazorpayReady, openRazorpayPayment } = useRazorpayPayment();

  const { mutate: insertSubscriptionMutation, isPending } = useMutation({
    mutationFn: purchasePlan,

    onSuccess: async (res, variables) => {
      const { data } = res;

      // Paid Plan with Razorpay Subscription
      if (data.razorpayOrderId && variables.amount > 0 && isRazorpayReady) {
        openRazorpayPayment({
          orderId: data.razorpayOrderId,
        });
        return;
      }

      // Free Plan - No Razorpay needed
      if (variables.amount === 0) {
        localStorage.clear();
        navigate(
          "/redirect?url=" + import.meta.env.VITE_WORKSPACE_PATH + "tenant",
        );
      }
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { insertSubscriptionMutation, isPending };
};
