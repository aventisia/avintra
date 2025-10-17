import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { purchasePlan } from "../apis/tenant-subscription-apis";
import type {
  RazorpayErrorResponse,
  // RazorpaySuccessResponse,
} from "../types/razorpay";

export const useInsertSubscriptionMutation = () => {
  const navigate = useNavigate();

  const { mutate: insertSubscriptionMutation, isPending } = useMutation({
    mutationFn: purchasePlan,

    onSuccess: async (res, variables) => {
      const { data } = res;

      // Paid Plan with Razorpay Subscription
      if (data.razorpaySubscriptionId && variables.amount > 0) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          subscription_id: data.razorpaySubscriptionId, // ✅ Razorpay Subscription ID
          name: "Aventisia Technology Private Limited",
          description: "Subscription Payment",
          image: "/logo.svg",
          handler: function () {
            // Payment Success
            localStorage.clear();
            navigate("/redirect?url=" + import.meta.env.VITE_WORC_URL);
          },
          prefill: {
            // email: data.customerEmail || "",
            // contact: data.customerPhone || "",
            // name:""
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
