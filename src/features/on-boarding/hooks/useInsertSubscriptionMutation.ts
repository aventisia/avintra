import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { purchasePlan } from "../apis/tenant-subscription-apis";

export const useInsertSubscriptionMutation = () => {
  const navigate = useNavigate();

  // Define mutation to purchase subscription plan
  const { mutate: insertSubscriptionMutation, isPending } = useMutation({
    mutationFn: purchasePlan,
    onSuccess: (res, variables) => {
      if (res.data.razorpayPaymentUrl) {
        window.location.href = res.data.razorpayPaymentUrl;
      }
      if (variables.amount == 0) {
        localStorage.clear();
        navigate("/redirect?url=" + import.meta.env.VITE_WORC_URL);
      }
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Return mutation and pending status
  return { insertSubscriptionMutation, isPending };
};
