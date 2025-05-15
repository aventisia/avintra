import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { summarizationModelTestFormZodSchema } from "../constants/summarization-model-test-form-zod-schema";

export const useSummarizationModelTestForm = () => {
  const form = useForm<z.infer<typeof summarizationModelTestFormZodSchema>>({
    resolver: zodResolver(summarizationModelTestFormZodSchema),
    defaultValues: {
      summarizedText:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eaque doloribus repellat est pariatur aut alias impedit cumque laudantium reiciendis. Magni officia voluptatibus repellendus magnam, quibusdam tempore quos blanditiis hic nihil. Porro repellat enim dicta distinctio necessitatibus earum voluptate! Beatae incidunt at labore maxime ipsum? Aut laudantium sed officia nesciunt dolore?",
      totalWords: 0,
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
