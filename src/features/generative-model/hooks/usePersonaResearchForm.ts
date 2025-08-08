import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { personaResearchZodSchema } from "../constants/generative-model-zod-schemas/persona-research-zod-schema";
import { useQueryClient } from "@tanstack/react-query";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { PersonaResearchDTO } from "../dtos/persona-research-dto";


export const usePersonaResearchForm = () => {
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const form = useForm<z.infer<typeof personaResearchZodSchema>>({
    resolver: zodResolver(personaResearchZodSchema),
    defaultValues: {
      id: modelId ?? "",
      generativeModel: {
        name: "PersonaResearch",
        configurationType: "OnPrem",
        llm: "gemma",
        temperature: 0.6,
        nodePrompt: "",
        setupObject: {
          personaName: "",
          companyName: "",
          links: [{url: ""}],
          purposeOfResearch: "",
          desiredOutput: "",
        },
      }
    },
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get models data from query client
    const generativeModelData = queryClient.getQueryData<{
      data: PersonaResearchDTO;
    }>(["GENERATIVE_SETUP_FORM_DATA"]);

    if(generativeModelData?.data?.generativeModel?.name === "PersonaResearch") {
        form.reset({
          id: generativeModelData?.data.id ?? modelId ?? "",
          generativeModel: generativeModelData?.data.generativeModel ?? {
            name: "PersonaResearch",
            configurationType: "OnPrem",
            llm: "gemma",
            temperature: 0.6,
            nodePrompt: "",
            setupObject: {
              personaName: "",
              companyName: "",
              links: [{url: ""}],
              purposeOfResearch: "",
              desiredOutput: "",
            },
          }
        })
    }
  }, [form, queryClient, modelId]);
  
 

  return {
    form,
    isDirty,
    isSubmitting,
  };
};
