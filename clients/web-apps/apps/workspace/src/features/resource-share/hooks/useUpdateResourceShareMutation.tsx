import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { updateResourceShare } from "../apis/resource-share-apis";
import { RESOURCE_USER_KEY } from "../constant";
import { useResourceShareStore } from "../stores/resource-share-store";

export const useUpdateResourceShareMutation = () => {
  // Get the query client for cache management
  const queryClient = useQueryClient();

  const { resourceId } = useResourceShareStore(
    useShallow((s) => ({
      resourceId: s.resourceId,
    })),
  );

  return useMutation({
    mutationFn: updateResourceShare,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({
        queryKey: [RESOURCE_USER_KEY, resourceId],
      });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};
