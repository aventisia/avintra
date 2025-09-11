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
import { useCloudLanguagesStore } from "../store/cloud-languages-store";
import { useVoiceStore } from "../store/cloud-voices-store";
import { useSttStore } from "../store/speech-to-text-store";
import { useTtsStore } from "../store/text-to-speech-store";
import { useFetchSetupFormData } from "./useFetchSetupFormData";

export const useAIPersonaSetupForm = () => {
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const { updateSelectedLanguage, cloudLanguages } = useCloudLanguagesStore();
  const { updateSelectedSTTService, sttOptions } = useSttStore();
  const { updateSelectedTTSService, ttsOptions } = useTtsStore();
  const { updateSelectedVoice, voicesOptions } = useVoiceStore();
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
          contextMemoryTimeframe: "2",
          speechConfiguration: {
            configurationType: "OnPrem",
            onPremConfig: {
              language: "",
              voice: "",
            },
            cloudConfig: null,
          },
        },
      },
    },
  });
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { data, isLoading } = useFetchSetupFormData();

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
    if (isLoading) return;
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
            onPremConfig: {
              language:
                setupFormData?.aiPersona?.setupObject?.speechConfiguration
                  ?.onPremConfig?.language ?? "",
              voice:
                setupFormData?.aiPersona?.setupObject?.speechConfiguration
                  ?.onPremConfig?.voice ?? "",
            },
            cloudConfig: {
              language:
                setupFormData?.aiPersona?.setupObject?.speechConfiguration
                  ?.cloudConfig?.language ?? "",
              voice:
                setupFormData?.aiPersona?.setupObject?.speechConfiguration
                  ?.cloudConfig?.voice ?? "",
              speechToText: {
                name:
                  setupFormData?.aiPersona?.setupObject?.speechConfiguration
                    ?.cloudConfig?.speechToText?.name ?? "",
                secret:
                  setupFormData?.aiPersona?.setupObject?.speechConfiguration
                    ?.cloudConfig?.speechToText?.secret ?? "",
              },
              textToSpeech: {
                name:
                  setupFormData?.aiPersona?.setupObject?.speechConfiguration
                    ?.cloudConfig?.textToSpeech?.name ?? "",
                secret:
                  setupFormData?.aiPersona?.setupObject?.speechConfiguration
                    ?.cloudConfig?.textToSpeech?.secret ?? "",
              },
            },
          },
        },
      },
    });
  }, [form, queryClient, modelId, isLoading, data?.data]);

  useEffect(() => {
    const configTypeValue = form.getValues(
      "aiPersona.setupObject.speechConfiguration.configurationType",
    );
    if (configTypeValue === "OnPrem" || isLoading) return;

    const langValue = form.getValues(
      "aiPersona.setupObject.speechConfiguration.cloudConfig.language",
    );
    const sttServiceValue = form.getValues(
      "aiPersona.setupObject.speechConfiguration.cloudConfig.speechToText.name",
    );
    const ttsServiceValue = form.getValues(
      "aiPersona.setupObject.speechConfiguration.cloudConfig.textToSpeech.name",
    );
    const voiceValue = form.getValues(
      "aiPersona.setupObject.speechConfiguration.cloudConfig.voice",
    );

    updateSelectedLanguage(
      cloudLanguages.find((lang) => lang.value === langValue) ?? null,
    );

    updateSelectedSTTService(
      sttOptions.find((stt) => stt.value === sttServiceValue) ?? null,
    );

    updateSelectedTTSService(
      ttsOptions.find((tts) => tts.value === ttsServiceValue) ?? null,
    );

    updateSelectedVoice(
      voicesOptions.find((voice) => voice.value === voiceValue) ?? null,
    );
  }, [cloudLanguages, sttOptions, ttsOptions, voicesOptions]);

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

  const refineFormData = (
    formData: z.infer<typeof aiPersonaSetupFormZodSchema>,
  ) => {
    const configType =
      formData.aiPersona.setupObject.speechConfiguration.configurationType;

    const refinedFormData = {
      ...formData,
      aiPersona: {
        ...formData.aiPersona,
        setupObject: {
          ...formData.aiPersona.setupObject,
          speechConfiguration: {
            ...formData.aiPersona.setupObject.speechConfiguration,
            ...(configType === "OnPrem"
              ? {
                  // Keep onPremConfig, nullify cloudConfig
                  cloudConfig: null,
                }
              : {
                  // Keep cloudConfig, nullify onPremConfig
                  onPremConfig: null,
                }),
          },
        },
      },
    };

    return refinedFormData;
  };

  return {
    form,
    isSubmitting,
    isDirty,
    documentFields,
    addDocument,
    removeDocument,
    updateFormData,
    refineFormData,
    isUpdatePending,
  };
};
