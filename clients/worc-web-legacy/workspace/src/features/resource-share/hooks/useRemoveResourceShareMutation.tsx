import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { deleteResourceShare } from "../apis/resource-share-apis";
import { RESOURCE_USER_KEY } from "../constant";
import { useResourceShareStore } from "../stores/resource-share-store";

export const useRemoveResourceShareMutation = () => {
  // // Get the query client for cache management
  const queryClient = useQueryClient();

  const { resourceId } = useResourceShareStore(
    useShallow((s) => ({
      resourceId: s.resourceId,
    })),
  );

  return useMutation({
    mutationFn: deleteResourceShare,

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
