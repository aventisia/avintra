import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { updateInferenceModelSetupFormData } from "../apis/inference-model-setup-apis";
import { inferenceModelFormZodSchema } from "../constants/inference-model-zod-schema";
import { InferenceModelSetupDTO } from "../dtos/inference-model-setup-dto";

export const useInferenceModelSetupForm = () => {
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const form = useForm<z.infer<typeof inferenceModelFormZodSchema>>({
    resolver: zodResolver(inferenceModelFormZodSchema),
    defaultValues: {
      id: modelId || "",
      name: "",
      businessContext: "",
      description: "",
      classification: null,
      extraction: null,
      questionAnswer: null,
      sentimentAnalytics: null,
      summarization: null,
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get Setup Form Data
    const data = queryClient.getQueryData<{
      data: InferenceModelSetupDTO;
    }>(["INFERENCE_SETUP_FORM_DATA"]);

    const inferenceModelData = data?.data;

    form.reset({
      id: inferenceModelData?.id ?? modelId ?? "",
      businessContext: inferenceModelData?.businessContext ?? "",
      description: inferenceModelData?.description ?? "",
      name: inferenceModelData?.name ?? "",
      classification: inferenceModelData?.classification ?? null,
      extraction: inferenceModelData?.extraction ?? null,
      questionAnswer: inferenceModelData?.questionAnswer ?? null,
      sentimentAnalytics: inferenceModelData?.sentimentAnalytics ?? null,
      summarization: inferenceModelData?.summarization ?? null,
    });
  }, [form, queryClient, modelId]);

  const {
    formState: { isSubmitting, isDirty, errors },
    control,
  } = form;

  // Mutation to update form
  const { mutate: updateFormData, isPending: isUpdatePending } = useMutation({
    mutationFn: updateInferenceModelSetupFormData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["INFERENCE_SETUP_FORM_DATA"],
      });
      queryClient.invalidateQueries({
        queryKey: ["model", modelId],
      });
      toast.success("Data saved successfully");
    },
    onError: (error) => {
      console.error("Error updating data:", error);
      toast.error(error.toString() || "Failed to update form data");
    },
  });

  const refineFormData = (
    formData: z.infer<typeof inferenceModelFormZodSchema>,
  ) => {
    const extraction = formData.extraction;
    const classification = formData.classification;
    const sentimentAnalytics = formData.sentimentAnalytics;

    // Helper to generate a valid jsonPropertyName
    const toJsonPropertyName = (name: string) =>
      name
        .replace(/[^a-zA-Z0-9]/g, "_") // Remove non-alphanumeric
        .replace(/^\d+/, "_$&") // Remove leading digits
        .toLowerCase();

    if (extraction) {
      // Update fields
      if (Array.isArray(extraction.setupObject.fields)) {
        extraction.setupObject.fields = extraction.setupObject.fields.map(
          (field) => ({
            ...field,
            jsonPropertyName: toJsonPropertyName(field.name),
          }),
        );
      }

      // Update tables
      if (Array.isArray(extraction.setupObject.tables)) {
        extraction.setupObject.tables = extraction.setupObject.tables.map(
          (table) => ({
            ...table,
            tableHeaders: table.tableHeaders.map((header) => ({
              ...header,
              jsonPropertyName: toJsonPropertyName(header.name),
            })),
          }),
        );
      }
    }

    if (classification) {
      const seen = new Set<string>();
      for (const cat of classification.setupObject.categories) {
        const name = cat.name.trim().toLowerCase();
        if (seen.has(name)) {
          toast.error(
            `Duplicate category name "${cat.name}" found in Classification. Please ensure names are unique.`,
          );
          return;
        }
        seen.add(name);
      }
    }

    if (sentimentAnalytics) {
      const seen = new Set<string>();
      for (const cat of sentimentAnalytics.setupObject.categories) {
        const name = cat.name.trim().toLowerCase();
        if (seen.has(name)) {
          toast.error(
            `Duplicate category name "${cat.name}" found in Sentiment Analytics. Please ensure names are unique.`,
          );
          return;
        }
        seen.add(name);
      }
    }

    return formData;
  };

  return {
    isSubmitting,
    isDirty,
    control,
    form,
    errors,
    updateFormData,
    isUpdatePending,
    refineFormData,
  };
};
