import { updateExtractedData } from "@/apis/extracted-data-api";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

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
  const { extractedData } = useExtractedDataStore(
    useShallow((state) => ({
      extractedData: state.extractedData,
    })),
  );

  useEffect(() => {
    const wordCount = summarizedText
      ? summarizedText.trim().split(/\s+/).length
      : 0;

    setValue("totalWords", wordCount);
  }, [summarizedText, setValue]);

  useEffect(() => {
    const finalExtractedData = extractedData.extractedData ?? {};

    const isEmptyObject = Object.keys(finalExtractedData).length === 0;
    if (isEmptyObject) return;

    form.reset({
      submitForFineTuning: false,
      summarizedText: finalExtractedData.summary ?? "",
      totalWords: 0,
    });
  }, [extractedData, form]);

  const { mutateAsync: updateExtractedFormData, isPending: isUpdatePending } =
    useMutation({
      mutationFn: updateExtractedData,
      onError: () => {
        toast.error("Failed to update data.");
      },
    });

  const resetFormValues = () => {
    form.reset({
      submitForFineTuning: false,
      summarizedText: "",
      totalWords: 0,
    });
  };

  return {
    form,
    isSubmitting,
    isDirty,
    resetFormValues,
    updateExtractedFormData,
    isUpdatePending,
  };
};
