import { DEV_JWT_LS_KEY } from "@/react-toolkit/constants";

// import { useNavigate } from "react-router-dom";
import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { updateTenantInfo } from "../constants/tenant-info-apis";

export const useUpdateTenantInfoMutation = () => {
  // Get navigate function
  // const navigate = useNavigate();
  // Define mutation to updateTenantInfo
  const {
    mutateAsync: updateTenantInfoMutation,
    isPending: isCreationPending,
  } = useMutation({
    mutationFn: updateTenantInfo,
    onSuccess: ({ data }) => {
      //TODO: To be removed
      if (import.meta.env.DEV) {
        localStorage.setItem(DEV_JWT_LS_KEY, data.accessToken);
      }
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Return mutation and pending status
  return { updateTenantInfoMutation, isCreationPending };
};
