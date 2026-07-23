import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { deactivateMyAccount } from "../apis/my-account-apis";
import { useAccountDeactivationStore } from "../stores/account-deactivation-store";

export const useAccountDeactivateMutation = () => {
  // Get store state and actions
  const { setStepNo, setVerifyEmailData } = useAccountDeactivationStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setVerifyEmailData: state.setVerifyEmailData,
    })),
  );

  // Define mutation to update email of account
  const { mutate: deactivateMyAccountMutation, isPending: isDeactivationPending } = useMutation({
    mutationFn: deactivateMyAccount,
    onSuccess: () => {
      // Reset update email data
      // setupdateProfileEmailData(null);
    },
    onError: (error) => {
      toast.error(error.toString());
      setStepNo(1); // Go to previous step
    },
    onSettled: () => {
      // Reset verifyEmailData
      setVerifyEmailData(null);
      // Set stepNo to 1
      setStepNo(1);
    },
  });

  // Return mutation and pending status
  return { deactivateMyAccountMutation, isDeactivationPending };
};
