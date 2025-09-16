// import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useFetchSetupFormData } from "@/features/inferencing-model/hooks/useFetchSetupFormData";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { extractViaLLM } from "../apis/extract-via-llm-apis";
// import { updateFieldValueByFieldName } from "../features/pdf-previewer/utils";
import { ExtractRequestDto } from "../features/pdf-previewer/dtos/extract-request-dto";

export const useExtractViaLLMMutation = () => {
  const { setExtractedData } = useExtractedDataStore(
    useShallow((state) => ({
      setExtractedData: state.setExtractedData,
      extractedData: state.extractedData,
    })),
  );
  const { modelId: mlModelId, modelName } = useLabelDataStore();
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const modelId = queryParams.get("pid") || mlModelId || "";
  const queryClient = useQueryClient();
  const { data: setupFormData } = useFetchSetupFormData();
  const {
    classification,
    extraction,
    questionAnswer,
    sentimentAnalytics,
    summarization,
  } = setupFormData?.data || {};
  const models = [
    classification,
    extraction,
    questionAnswer,
    sentimentAnalytics,
    summarization,
  ];
  const nonNullModelCount = Math.max(
    1,
    models.filter((model) => model !== null && model !== undefined).length,
  );

  // TODO: Mutate credits/units used after successful extraction. For now we are making an api call due to database split but later we should update it from the backend itself
  const { mutate: updateCreditsUsed } = useMutation({
    mutationFn: (postObj: unknown) => {
      return axiosInstance.post(
        `${import.meta.env.VITE_ACCOUNTS_API_URL}/credit-usage`,
        postObj,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-credits"] });
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Define mutation to extract via LLM
  const { mutate: extractViaLLMMutation, isPending: isExtractionPending } =
    useMutation({
      mutationFn: ({ postObj }: { postObj: ExtractRequestDto }) =>
        extractViaLLM(postObj, nonNullModelCount),

      onSuccess: (httpResponse) => {
        if (!httpResponse.data.extractedData.length) return;

        setExtractedData(httpResponse.data.extractedData[0]);
        queryClient.invalidateQueries({
          queryKey: ["model", modelId],
        });
        toast.success("Data extracted successfully");

        // TODO: Update units/credits used. For now we are making an api call due to database split but later we should update it from the backend itself
        updateCreditsUsed({
          serviceType: httpResponse?.data?.extractedData[0]?.serviceType,
          consumedUnit: httpResponse?.data?.extractedData[0]?.executionTime,
          refType: "AIModel",
          refId: mlModelId,
          refName: modelName,
        });
      },

      onError: (error) => {
        toast.error(error.toString());
      },
    });

  return { extractViaLLMMutation, updateCreditsUsed, isExtractionPending };
};
