// import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@aventisia/ui/sonner";
import { useShallow } from "zustand/react/shallow";
import { extractViaLLM } from "../apis/extract-via-llm-apis";
// import { updateFieldValueByFieldName } from "../features/pdf-previewer/utils";
import { ExtractRequestDto } from "../features/pdf-previewer/dtos/extract-request-dto";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

export const useExtractViaLLMMutation = () => {
  // Get current annotation object and set annotation object
  // const { currAnnotationObj, setAnnotationObject } = useAnnotationDataStore(
  //   useShallow((state) => ({
  //     currAnnotationObj: state.currAnnotationObj,
  //     setAnnotationObject: state.setAnnotationObject,
  //   })),
  // );
  const { setExtractedData } = useExtractedDataStore(
    useShallow((state) => ({
      setExtractedData: state.setExtractedData,
      extractedData: state.extractedData
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
      
      setExtractedData(httpResponse.data.filesExtractedData[0])
      toast.success("Data extracted successfully");
      
      
      // Update annotation object with extracted data
      // const updatedAnnotationObj = updateFieldValueByFieldName(
      //   currAnnotationObj,
      //   httpResponse.data.filesExtractedData[0].extractedData,
      // );

      // setAnnotationObject(updatedAnnotationObj);
      

      // Show toast
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { extractViaLLMMutation, isExtractionPending };
};
