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
      temperature: 0.7,
      enableAudio: false,
      enableVideo: false,
      enableChat: false,
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
    name: "documents",
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
    const setupFormData = data?.data.setupObject;

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
      temperature: setupFormData?.temperature ?? 0.7,
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
