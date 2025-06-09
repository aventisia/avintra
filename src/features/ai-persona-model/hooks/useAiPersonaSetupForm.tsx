import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { updateAiPersonaSetupFormData } from "../apis/ai-persona-setup-api";
import { aiPersonaSetupFormZodSchema } from "../constants/ai-persona-setup-zod-schema";
import { AiPersonaSetupDTO } from "../dtos/ai-persona-setup-dto";

export const useAIPersonaSetupForm = () => {
  const form = useForm<z.infer<typeof aiPersonaSetupFormZodSchema>>({
    resolver: zodResolver(aiPersonaSetupFormZodSchema),
    defaultValues: {
      name: "",
      roleOrObjective: "",
      categoryOrDomain: "",
      toneOfVoice: "",
      instructions: "",
      exclusionsOrBoundaries: "",
      documents: null,
      contextMemoryTimeframe: "",
      llm: "",
      temperature: 0,
      enableAudio: false,
      enableVideo: false,
      enableChat: false,
    },
  });

  const {
    formState: { isSubmitting, isDirty },
    control,
  } = form;

  // useFieldArray for handling the dynamic array of categories
  const {
    fields: documentFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "documents",
  });

  // Function to add a new object to categories
  const addDocument = () => {
    append({ name: "", instructions: "" });
  };

  // Function to remove an object from categories
  const removeDocument = (index: number) => {
    remove(index);
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get Setup Form Data
    const data = queryClient.getQueryData<{
      data: AiPersonaSetupDTO;
    }>(["AI_PERSONA_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data.setupObject;
    console.log(setupFormData);

    form.reset({
      name: setupFormData?.name ?? "",
      roleOrObjective: setupFormData?.roleOrObjective ?? "",
      categoryOrDomain: setupFormData?.categoryOrDomain ?? "",
      toneOfVoice: setupFormData?.toneOfVoice ?? "",
      instructions: setupFormData?.instructions ?? "",
      exclusionsOrBoundaries: setupFormData?.exclusionsOrBoundaries ?? "",
      documents: setupFormData?.documents ?? null,
      contextMemoryTimeframe: setupFormData?.contextMemoryTimeframe ?? "",
      llm: setupFormData?.llm ?? "",
      temperature: setupFormData?.temperature ?? 0,
      enableAudio: setupFormData?.enableAudio ?? false,
      enableVideo: setupFormData?.enableVideo ?? false,
      enableChat: setupFormData?.enableChat ?? false,
    });
  }, [form, queryClient]);

  // Mutation to update form data
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const { mutate: updateFormData, isPending: isUpdatePending } = useMutation({
    mutationFn: updateAiPersonaSetupFormData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["AI_PERSONA_SETUP_FORM_DATA"],
      });
      queryClient.invalidateQueries({
        queryKey: ["model", modelId],
      });
      toast.success("Data saved successfully");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return {
    form,
    isSubmitting,
    isDirty,
    documentFields,
    addDocument,
    removeDocument,
    updateFormData,
    isUpdatePending,
  };
};
