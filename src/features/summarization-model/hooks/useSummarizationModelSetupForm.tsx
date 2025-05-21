import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
      charactersPerChunk: 0,
      chunkOverlap: 0,
      totalMinimumWords: 0,
      totalMaximumWords: 0,
      summarizationMethod: "",
      mapIndividualSummaryPrompt: "",
      mapFinalCombinePrompt: "",
      refineSubsequentPrompt: "",
      refineInitialPrompt: "",
      stuffPrompt: "",
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
      charactersPerChunk: setupFormData?.charactersPerChunk ?? 0,
      chunkOverlap: setupFormData?.chunkOverlap ?? 0,
      totalMinimumWords: setupFormData?.totalMinimumWords ?? 0,
      totalMaximumWords: setupFormData?.totalMaximumWords ?? 0,
      summarizationMethod: setupFormData?.summarizationMethod ?? "",
      mapIndividualSummaryPrompt:
        setupFormData?.mapIndividualSummaryPrompt ?? "",
      mapFinalCombinePrompt: setupFormData?.mapFinalCombinePrompt ?? "",
      refineSubsequentPrompt: setupFormData?.refineSubsequentPrompt ?? "",
      refineInitialPrompt: setupFormData?.refineInitialPrompt ?? "",
      stuffPrompt: setupFormData?.stuffPrompt ?? "",
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
    },
    onError: (error) => {
      console.error("Error updating data:", error);
      toast.error("Failed to update form data");
    },
  });

  const refineFormData = (
    formData: z.infer<typeof summarizationModelSetupFormZodSchema>,
  ) => {
    let refinedValues = { ...formData };

    switch (formData.summarizationMethod) {
      case "MapReduce":
        refinedValues = {
          ...refinedValues,
          refineSubsequentPrompt: "",
          refineInitialPrompt: "",
          stuffPrompt: "",
        };
        break;
      case "Refine":
        refinedValues = {
          ...refinedValues,
          mapIndividualSummaryPrompt: "",
          mapFinalCombinePrompt: "",
          stuffPrompt: "",
        };
        break;
      case "Stuff":
        refinedValues = {
          ...refinedValues,
          mapIndividualSummaryPrompt: "",
          mapFinalCombinePrompt: "",
          refineSubsequentPrompt: "",
          refineInitialPrompt: "",
        };
        break;
    }

    return refinedValues;
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
