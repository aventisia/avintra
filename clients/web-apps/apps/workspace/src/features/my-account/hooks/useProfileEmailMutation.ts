import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { updateMyAccountEmail } from "../apis/my-account-apis";
import { useProfileEmailUpdateStore } from "../stores/profile-email-update-store";

export const useProfileEmailMutation = () => {
  // Get store state and actions
  const { setStepNo, setupdateProfileEmailData, setVerifyEmailData } = useProfileEmailUpdateStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setVerifyEmailData: state.setVerifyEmailData,
      setupdateProfileEmailData: state.setUpdateProfileEmailData,
    })),
  );

  // Define mutation to update email of account
  const { mutate: updateProfileEmailMutation, isPending: isUpdatePending } = useMutation({
    mutationFn: updateMyAccountEmail,
    onSuccess: (data) => {
      // Reset update email data
      setupdateProfileEmailData(null);
      toast.success(data.message);
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
  return { updateProfileEmailMutation, isUpdatePending };
};
