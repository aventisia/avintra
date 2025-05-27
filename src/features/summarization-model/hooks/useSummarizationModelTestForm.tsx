import { updateExtractedData } from "@/apis/extracted-data-api";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { summarizationModelTestFormZodSchema } from "../constants/summarization-model-test-form-zod-schema";
import { useFetchTestFormData } from "./useFetchTestFormData";

export const useSummarizationModelTestForm = () => {
  const { data: fieldDataValues } = useFetchTestFormData();
  const form = useForm<z.infer<typeof summarizationModelTestFormZodSchema>>({
    resolver: zodResolver(summarizationModelTestFormZodSchema),
    defaultValues: {
      summarizedText: "",
      submitForFineTuning: false,
    },
  });

  console.log("FDV", fieldDataValues);

  const { selectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
    })),
  );

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  const { extractedData } = useExtractedDataStore(
    useShallow((state) => ({
      extractedData: state.extractedData,
    })),
  );

  useEffect(() => {
    if (!fieldDataValues || !selectedFile) return;

    const matchingExtractedData = fieldDataValues.data.find(
      (item) => item.docId === selectedFile.id,
    );

    if (matchingExtractedData) {
      form.reset({
        submitForFineTuning:
          matchingExtractedData?.submitForFineTuning ?? false,
        summarizedText: matchingExtractedData?.extractedData.summary ?? "",
      });
    }
  }, [form, selectedFile, fieldDataValues]);

  useEffect(() => {
    const finalExtractedData = extractedData.extractedData ?? {};

    const isEmptyObject = Object.keys(finalExtractedData).length === 0;
    if (isEmptyObject) return;

    form.reset({
      submitForFineTuning: false,
      summarizedText: finalExtractedData.summary ?? "",
    });
  }, [extractedData, form]);

  const { mutateAsync: updateExtractedFormData, isPending: isUpdatePending } =
    useMutation({
      mutationFn: updateExtractedData,
      onSuccess: () => {
        toast.success("Data successfully updated.");
      },
      onError: () => {
        toast.error("Failed to update data.");
      },
    });

  const resetFormValues = () => {
    form.reset({
      submitForFineTuning: false,
      summarizedText: "",
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
