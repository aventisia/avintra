import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { summarizationModelSetupFormZodSchema } from "../constants/summarization-model-setup-zod-schema";

export const useSummarizationModelSetupForm = () => {
  const form = useForm<z.infer<typeof summarizationModelSetupFormZodSchema>>({
    resolver: zodResolver(summarizationModelSetupFormZodSchema),
    defaultValues: {
      context: "",
      charactersPerChunk: 0,
      chunkOverlap: 0,
      totalMinWords: 0,
      totalMaxWords: 0,
      summarizationMethod: "",
      individualSummaryPrompt: "",
      finalPromptToCombine: "",
      subsequentPrompt: "",
      initialPrompt: "",
      prompt: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  return {
    form,
    isSubmitting,
    isDirty,
  };
};
