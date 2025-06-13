// import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@aventisia/ui/sonner";
import { useShallow } from "zustand/react/shallow";
import { extractViaLLM } from "../apis/extract-via-llm-apis";
// import { updateFieldValueByFieldName } from "../features/pdf-previewer/utils";
import { ExtractRequestDto } from "../features/pdf-previewer/dtos/extract-request-dto";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export const useExtractViaLLMMutation = () => {
  const { setExtractedData } = useExtractedDataStore(
    useShallow((state) => ({
      setExtractedData: state.setExtractedData,
      extractedData: state.extractedData
    })),
  );
    const { modelId: mlModelId } = useLabelDataStore();
    const location = useLocation();
    const queryParams = useMemo(
      () => new URLSearchParams(location.search),
        [location.search],
    );
    const modelId = queryParams.get("mid") || mlModelId || "";
    const queryClient = useQueryClient();
    
  

  // Define mutation to extract via LLM
  const { mutate: extractViaLLMMutation, isPending: isExtractionPending } = useMutation({
    mutationFn: ({
      postObj,
      modelType,
    }: {
      postObj: ExtractRequestDto;
      modelType: string;
    }) => extractViaLLM(postObj, modelType),

    onSuccess: (httpResponse) => {
      
      if (!httpResponse.data.filesExtractedData.length) return;
      
      setExtractedData(httpResponse.data.filesExtractedData[0])
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
