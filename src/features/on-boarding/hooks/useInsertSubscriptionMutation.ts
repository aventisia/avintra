import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { purchasePlan } from "../apis/tenant-subscription-apis";
import type {
  RazorpayErrorResponse,
  // RazorpaySuccessResponse,
} from "../types/razorpay";

export const useInsertSubscriptionMutation = (isRazorpayReady: boolean) => {
  const navigate = useNavigate();

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
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          subscription_id: data.razorpaySubscriptionId, // Razorpay Subscription ID
          name: "Aventisia Technologies Pvt Ltd",
          description: "Subscription Payment",
          image: "/logo_icon.jpg",

          handler: function () {
            // Payment Success
            localStorage.clear();
            navigate("/redirect?url=" + import.meta.env.VITE_WORC_URL);
          },

          theme: {
            color: "#0f172a", // optional theme color
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();

        razorpay.on(
          "payment.failed",
          function (response: RazorpayErrorResponse) {
            toast.error("Payment failed: " + response.error.description);
          },
        );

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
