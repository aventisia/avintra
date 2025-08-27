import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { publishModel } from "../apis/publish-model-apis";

export const usePublishModelMutation = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { modelId: mlModelId } = useLabelDataStore();

  // Get flow id and version id from url
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const modelId = queryParams.get("mid") || mlModelId || "";

  const { isPending, mutate } = useMutation({
    mutationFn: publishModel,
    onSuccess: (httpResponse) => {
      // Success message
      queryClient.refetchQueries({ queryKey: ["model", modelId] });
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.toString());
    },
  });
  return {
    isPending,
    mutate,
  };
};
