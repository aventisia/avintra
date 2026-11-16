import { toast } from "@avplatform/ui/sonner";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";

import { updateTenantInfo } from "../constants/tenant-info-apis";

export const useUpdateTenantInfoMutation = () => {
  const { mutateAsync: updateTenantInfoMutation, isPending: isCreationPending } = useMutation({
    mutationFn: updateTenantInfo,
    onError: (error) => {
      toast.error(getMutationErrorMessage(error));
    },
  });

  return { updateTenantInfoMutation, isCreationPending };
};
