// import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useFetchSetupFormData } from "@/features/inferencing-model/hooks/useFetchSetupFormData";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
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
  const { modelId: mlModelId } = useLabelDataStore();
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
      },

      onError: (error) => {
        toast.error(error.toString());
      },
    });

  return { extractViaLLMMutation, isExtractionPending };
};
