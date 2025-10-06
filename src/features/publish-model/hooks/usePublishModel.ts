import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { publishModel } from "../apis/publish-model-apis";
import { usePublishDialogStore } from "../stores/usePublishDialogStore";

export const usePublishModelMutation = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { modelId: mlModelId } = useLabelDataStore();

  const { setOpen } = usePublishDialogStore();

  // Get flow id and version id from url
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const modelId = queryParams.get("pid") || mlModelId || "";

  const { isPending, mutate } = useMutation({
    mutationFn: publishModel,
    onSuccess: (httpResponse) => {
      setOpen(false);
      // Success message
      queryClient.refetchQueries({ queryKey: ["model", modelId] });
      queryClient.invalidateQueries({ queryKey: ["project", modelId] });
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
