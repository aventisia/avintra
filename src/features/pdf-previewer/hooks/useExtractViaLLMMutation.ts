import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { extractViaLLM } from "../apis/extract-via-llm-apis";
import { updateFieldValueByFieldName } from "../utils";
import { ExtractRequestDto } from "../dtos/extract-request-dto";

export const useExtractViaLLMMutation = () => {
  // Get current annotation object and set annotation object
  const { currAnnotationObj, setAnnotationObject } = useAnnotationDataStore(
    useShallow((state) => ({
      currAnnotationObj: state.currAnnotationObj,
      setAnnotationObject: state.setAnnotationObject,
    })),
  );

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

      // Update annotation object with extracted data
      const updatedAnnotationObj = updateFieldValueByFieldName(
        currAnnotationObj,
        httpResponse.data.filesExtractedData[0].extractedData,
      );

      setAnnotationObject(updatedAnnotationObj);

      // Show toast
      toast.success("Data extracted successfully");
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { extractViaLLMMutation, isExtractionPending };
};
