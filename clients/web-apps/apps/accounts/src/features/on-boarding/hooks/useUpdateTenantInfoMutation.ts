// import { useNavigate } from "react-router-dom";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { updateTenantInfo } from "../constants/tenant-info-apis";

export const useUpdateTenantInfoMutation = () => {
  // Get navigate function
  // const navigate = useNavigate();
  // Define mutation to updateTenantInfo
  const { mutateAsync: updateTenantInfoMutation, isPending: isCreationPending } = useMutation({
    mutationFn: updateTenantInfo,
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Return mutation and pending status
  return { updateTenantInfoMutation, isCreationPending };
};
