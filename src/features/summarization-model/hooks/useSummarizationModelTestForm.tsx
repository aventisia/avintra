import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { summarizationModelTestFormZodSchema } from "../constants/summarization-model-test-form-zod-schema";

export const useSummarizationModelTestForm = () => {
  const form = useForm<z.infer<typeof summarizationModelTestFormZodSchema>>({
    resolver: zodResolver(summarizationModelTestFormZodSchema),
    defaultValues: {
      summarizedText: "",
      totalWords: 0,
      submitForFineTuning: false,
    },
  });

  const {
    control,
    setValue,
    formState: { isSubmitting, isDirty },
  } = form;

  const summarizedText = useWatch({
    control,
    name: "summarizedText",
  });

  useEffect(() => {
    const wordCount = summarizedText
      ? summarizedText.trim().split(/\s+/).length
      : 0;

    setValue("totalWords", wordCount, { shouldDirty: true });
  }, [summarizedText, setValue]);

  return {
    form,
    isSubmitting,
    isDirty,
  };
};
