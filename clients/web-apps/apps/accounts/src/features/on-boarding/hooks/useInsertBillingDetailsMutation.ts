import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { insertBillingDetails } from "../apis/billing-details-apis";
import { useChoosePlanStore } from "../stores/choose-plan-store";

export const useInsertBillingDetailsMutation = () => {
  // Get store state and actions
  const { setStepNo } = useChoosePlanStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setBillingData: state.setBillingData,
    })),
  );

  // Define mutation to create account
  const { mutate: insetBillingDetailsMutation, isPending } = useMutation({
    mutationFn: insertBillingDetails,
    onSuccess: (httpResponse) => {
      toast.success(httpResponse.message);
      setStepNo(3);
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Return mutation and pending status
  return { insetBillingDetailsMutation, isPending };
};
