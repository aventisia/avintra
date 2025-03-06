import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { extractViaLLM } from "../apis/extract-via-llm-apis";
import { updateFieldValueByFieldName } from "../utils";

export const useExtractViaLLMMutation = () => {
  // Get current annotation object and set annotation object
  const { currAnnotationObj, setAnnotationObject } = useAnnotationDataStore(
    useShallow((state) => ({
      currAnnotationObj: state.currAnnotationObj,
      setAnnotationObject: state.setAnnotationObject,
    })),
  );

  // Define mutation to extract via LLM
  const { mutate: extractViaLLMMutation, isPending: isExtractionPending } =
    useMutation({
      mutationFn: extractViaLLM,
      onSuccess: (httpResponse) => {
        // If no extracted data, return
        if (!httpResponse.data.filesExtractedData.length) return;

        // Update annotation object with extracted data
        const updatedAnnotationObj = updateFieldValueByFieldName(
          currAnnotationObj,
          httpResponse.data.filesExtractedData[0].extractedData,
        );

        // Set updated annotation object
        setAnnotationObject(updatedAnnotationObj);

        // Show toast
        toast.success("Data extracted successfully");
      },
      onError: (error) => {
        // Show toast on error
        toast.error(error.toString());
      },
    });

  // Return mutation and pending status
  return { extractViaLLMMutation, isExtractionPending };
};
