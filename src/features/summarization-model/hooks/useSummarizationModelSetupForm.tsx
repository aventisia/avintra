import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { updateSummarizationSetupFormData } from "../apis/summarization-setup-api";
import { summarizationModelSetupFormZodSchema } from "../constants/summarization-model-setup-zod-schema";
import { SummarizationSetupDTO } from "../dtos/summarization-setup-dto";

export const useSummarizationModelSetupForm = () => {
  const form = useForm<z.infer<typeof summarizationModelSetupFormZodSchema>>({
    resolver: zodResolver(summarizationModelSetupFormZodSchema),
    defaultValues: {
      context: "",
      totalMinimumWords: 0,
      totalMaximumWords: 0,
      summarizationMethod: "stuff",
      stuffPrompt: `You are an expert summarisation assistant. Your task is to read the provided content and generate a clear, concise, and accurate summary that captures the key ideas, main points, and critical information, while removing redundant or unimportant details.\nFocus on preserving the original intent and tone of the content. The summary should be easily understandable and suitable for someone who has not read the full text.\nIf the content is structured (like emails, reports, meeting transcripts, articles), maintain the logical flow and structure in the summary.\nBe objective, factual, and avoid adding personal opinions or interpretations.`,
      llm: "",
      temperature: 0,
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get Setup Form Data
    const data = queryClient.getQueryData<{
      data: SummarizationSetupDTO;
    }>(["SUMMARIZATION_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;

    form.reset({
      context: setupFormData?.context ?? "",
      totalMinimumWords: setupFormData?.totalMinimumWords ?? 0,
      totalMaximumWords: setupFormData?.totalMaximumWords ?? 0,
      summarizationMethod: "stuff",
      stuffPrompt: setupFormData?.stuffPrompt || form.getValues("stuffPrompt"),
      llm: setupFormData?.llm ?? "",
      temperature: setupFormData?.temperature ?? 0,
    });
  }, [form, queryClient]);

  // Mutation to update form data
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const { mutate: updateFormData, isPending: isUpdatePending } = useMutation({
    mutationFn: updateSummarizationSetupFormData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["SUMMARIZATION_SETUP_FORM_DATA"],
      });
      queryClient.invalidateQueries({
        queryKey: ["model", modelId],
      });
      toast.success("Data saved successfully");
    },
    onError: (error) => {
      console.error("Error updating data:", error);
      toast.error("Failed to update form data");
    },
  });

  const refineFormData = (
    formData: z.infer<typeof summarizationModelSetupFormZodSchema>,
  ) => {
    return formData;
  };

  return {
    form,
    isSubmitting,
    isDirty,
    updateFormData,
    isUpdatePending,
    refineFormData,
  };
};
