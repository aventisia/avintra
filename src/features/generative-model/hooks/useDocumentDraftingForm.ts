import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { documentDraftingZodSchema } from "../constants/generative-model-zod-schemas/document-drafting-zod-schema";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DocumentDraftingDTO } from "../dtos/document-drafting-dto";


export const useDocumentDraftingForm = () => {
  const { modelId } = useLabelDataStore(
      useShallow((state) => ({
        modelId: state.modelId,
      })),
    );
  const form = useForm<z.infer<typeof documentDraftingZodSchema>>({
    resolver: zodResolver(documentDraftingZodSchema),
    defaultValues: {
        id: modelId ?? "",
        generativeModel: {
          name: "DocumentDrafting",
          configurationType: "OnPrem",
          llm: "gemma",
          nodePrompt: "",
          temperature: 0.6,
          setupObject:{
            documentTitle: "",
            documentType: "",
            guidelineInstruction: "",
            outputStructure: "",
            localizationNeeded: "",
            preferenceDocuments: null,
          }
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
      data: DocumentDraftingDTO;
    }>(["GENERATIVE_SETUP_FORM_DATA"]);

    if(generativeModelData?.data?.generativeModel?.name === "DocumentDrafting") {
        form.reset({
          id: generativeModelData?.data.id ?? modelId ?? "",
          generativeModel : generativeModelData?.data.generativeModel ?? {
            name: "DocumentDrafting",
            configurationType: "OnPrem",
            llm: "gemma",
            temperature: 0.6,
            nodePrompt: "",
            setupObject: {
              documentTitle: "",
              documentType: "",
              guidelineInstruction: "",
              localizationNeeded: "",
              outputStructure: "",
              preferenceDocuments: null
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
