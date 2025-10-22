import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      if (
        data.razorpaySubscriptionId &&
        variables.amount > 0 &&
        isRazorpayReady
      ) {
        openRazorpayPayment(data.razorpaySubscriptionId);
        return;
      }

      // Free Plan - No Razorpay needed
      if (variables.amount === 0) {
        localStorage.clear();
        navigate("/redirect?url=" + import.meta.env.VITE_WORC_URL);
      }
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { insertSubscriptionMutation, isPending };
};
