import {
  getInferenceModelDataById,
  updateInferenceModelSetupFormData,
} from "@/features/inferencing-model/apis/inference-model-setup-apis";

import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { insertMLModelVersion } from "../apis/model-version-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useOpenModel } from "./useOpenModel";

export const useInsertModelVersionMutation = ({
  mlModelId,
  versionId,
}: {
  mlModelId: string;
  versionId: string;
}) => {
  // Get query client
  const queryClient = useQueryClient();

  // Get handle function to open flow
  const handleOpenModelAction = useOpenModel();

  const { isPending, mutate } = useMutation({
    mutationFn: insertMLModelVersion,
    onSuccess: async (httpResponse) => {
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });

      const setupData = await getInferenceModelDataById(
        mlModelId || "modelId",

        versionId,
      );

      if (setupData?.data && httpResponse.data)
        updateInferenceModelSetupFormData({
          name: setupData?.data.name,
          aiProjectVersionId: httpResponse.data.id || "",
          businessContext: setupData?.data.businessContext,
          classification: setupData?.data.classification,
          extraction: setupData?.data.extraction,
          questionAnswer: setupData?.data.questionAnswer,
          sentimentAnalytics: setupData?.data.sentimentAnalytics,
          summarization: setupData?.data.summarization,
          id: setupData?.data.id,
        }).then(() => {
          handleOpenModelAction(
            httpResponse.data.aiProjectId,
            setupData?.data.name,
            httpResponse.data.id,
          );
        });

      // Success message
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
