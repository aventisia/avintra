import { useMutation } from "@tanstack/react-query";
import { extractViaLLM } from "../apis/extract-via-llm-apis";

export const useExtractViaLLMMutation = () => {
  // Define mutation to extract via LLM
  const { mutate: extractViaLLMMutation, isPending: isExtractionPending } =
    useMutation({
      mutationFn: extractViaLLM,
      onSuccess: (httpResponse) => {
        console.log(httpResponse);
      },
      onError: () => {},
      onSettled: () => {},
    });

  // Return mutation and pending status
  return { extractViaLLMMutation, isExtractionPending };
};
