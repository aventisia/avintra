import { deleteInsertedFileById } from "@/features/file-uploader-setup/apis/file-upload-apis";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { useShowAlertHandler } from "@aventisia/ui/hooks";
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
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const form = useForm<z.infer<typeof aiPersonaSetupFormZodSchema>>({
    resolver: zodResolver(aiPersonaSetupFormZodSchema),
    defaultValues: {
      id: modelId || "",
      aiPersona: {
        name: "AIPersona",
        configurationType: "OnPrem",
        llm: "gemma",
        nodePrompt: "node prompt",
        temperature: 0.7,
        setupObject: {
          name: "",
          roleOrObjective: "",
          categoryOrDomain: "",
          toneOfVoice: "",
          instructions: "",
          exclusionsOrBoundaries: "",
          documents: null,
          contextMemoryTimeframe: "",
          speechConfiguration: {
            configurationType: "OnPrem",
            language: "",
            speechToText: "",
            textToSpeech: "",
            voice: "",
          },
        },
      },
    },
  });
  const { showDefaultAlertDialog } = useShowAlertHandler();

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
    name: "aiPersona.setupObject.documents",
  });

  // Function to add a new object to categories
  const addDocument = () => {
    append([]);
  };

  type MutationParams = {
    id: string;
    index: number;
  };

  const { mutate: removeInsertedDocument } = useMutation({
    mutationFn: ({ id }: MutationParams) => deleteInsertedFileById(id),
    onSuccess: async (_data, variables) => {
      remove(variables.index); // ✅ Now TypeScript knows 'index' exists
      toast.success("File deleted successfully");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Function to remove an object from categories
  const removeDocument = (id: string, index: number) => {
    showDefaultAlertDialog({
      confirmActionFn: () => {
        removeInsertedDocument({ id, index });
      },
      alertType: "delete-record",
      additionalText: `File`,
    });
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get Setup Form Data
    const data = queryClient.getQueryData<{
      data: AiPersonaSetupDTO;
    }>(["AI_PERSONA_SETUP_FORM_DATA"]);

    // Extract setupObject from fetched data
    const setupFormData = data?.data;

    form.reset({
      id: setupFormData?.id ?? modelId ?? "",
      aiPersona: {
        name: setupFormData?.aiPersona?.name ?? "AIPersona",
        configurationType:
          setupFormData?.aiPersona?.configurationType ?? "OnPrem",
        llm: setupFormData?.aiPersona?.llm ?? "gemma",
        nodePrompt: setupFormData?.aiPersona?.nodePrompt ?? "node prompt",
        temperature: setupFormData?.aiPersona?.temperature ?? 0.7,
        setupObject: {
          name: setupFormData?.aiPersona?.setupObject?.name ?? "",
          roleOrObjective:
            setupFormData?.aiPersona?.setupObject?.roleOrObjective ?? "",
          categoryOrDomain:
            setupFormData?.aiPersona?.setupObject?.categoryOrDomain ?? "",
          toneOfVoice: setupFormData?.aiPersona?.setupObject?.toneOfVoice ?? "",
          instructions:
            setupFormData?.aiPersona?.setupObject?.instructions ?? "",
          exclusionsOrBoundaries:
            setupFormData?.aiPersona?.setupObject?.exclusionsOrBoundaries ?? "",
          documents: setupFormData?.aiPersona?.setupObject?.documents ?? null,
          contextMemoryTimeframe:
            setupFormData?.aiPersona?.setupObject?.contextMemoryTimeframe ?? "",
          speechConfiguration: {
            configurationType:
              setupFormData?.aiPersona?.setupObject?.speechConfiguration
                ?.configurationType ?? "OnPrem",
            language:
              setupFormData?.aiPersona?.setupObject?.speechConfiguration
                ?.language ?? "",
            voice:
              setupFormData?.aiPersona?.setupObject?.speechConfiguration
                ?.voice ?? "",
            textToSpeech:
              setupFormData?.aiPersona?.setupObject?.speechConfiguration
                ?.textToSpeech ?? "",
            speechToText:
              setupFormData?.aiPersona?.setupObject?.speechConfiguration
                ?.speechToText ?? "",
          },
        },
      },
    });
  }, [form, queryClient, modelId]);

  // Mutation to update form data
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
