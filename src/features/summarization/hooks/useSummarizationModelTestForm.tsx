import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { summarizationModelTestFormZodSchema } from "../constants/summarization-model-test-form-zod-schema";

export const useSummarizationModelTestForm = () => {
  const form = useForm<z.infer<typeof summarizationModelTestFormZodSchema>>({
    resolver: zodResolver(summarizationModelTestFormZodSchema),
    defaultValues: {
      summarizedText: "",
      totalMinWords: 0,
      totalMaxWords: 0,
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
