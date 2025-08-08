import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { companyDeepDivesZodSchema } from "../constants/generative-model-zod-schemas/company-deep-dives-zod-schema";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import {  useQueryClient } from "@tanstack/react-query";
import { CompanyDeepDivesDTO } from "../dtos/company-deep-dives-dto";
import { useEffect } from "react";


export const useCompanyDeepDivesForm = () => {
const { modelId } = useLabelDataStore(
      useShallow((state) => ({
        modelId: state.modelId,
      })),
    );  const form = useForm<z.infer<typeof companyDeepDivesZodSchema>>({
    resolver: zodResolver(companyDeepDivesZodSchema),
    defaultValues: {
      id: modelId ?? "",
     generativeModel: {
        name: "CompanyDeepDive",
        temperature: 0.2,
        configurationType: "OnPrem",
        llm: "gemma",
        nodePrompt: "",
        setupObject: {
          companyName: "",
          websiteLink: "",
          focusArea: "",
          webData: "",
          links: [{ url: ""}],
          summaryDepth: "",
          documents: null,
        }   
      },
    }
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;
  
  const queryClient = useQueryClient();
  useEffect(() => {
    // Get models data from query client
    const generativeModelData = queryClient.getQueryData<{
      data: CompanyDeepDivesDTO;
    }>(["GENERATIVE_SETUP_FORM_DATA"]);

    if(generativeModelData?.data?.generativeModel?.name === "CompanyDeepDive") {
        form.reset({
          id: generativeModelData?.data.id ?? modelId ?? "",
          generativeModel: generativeModelData?.data.generativeModel  ?? {
            name: "CompanyDeepDive",
            temperature: 0.2,
            configurationType: "OnPrem",
            llm: "gemma",
            nodePrompt: "",
            setupObject: {
              companyName: "",
              websiteLink: "",
              focusArea: "",
              webData: "",
              links: [{ url: ""}],
              summaryDepth: "",
              documents: null,
          }
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
