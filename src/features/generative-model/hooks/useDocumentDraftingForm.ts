import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { documentDraftingZodSchema } from "../constants/generative-model-zod-schemas/document-drafting-zod-schema";
import { useSelectedTaskStore } from "../store/selected-task-store";


export const useDocumentDraftingForm = () => {
  const {selectedTask} = useSelectedTaskStore();
  const form = useForm<z.infer<typeof documentDraftingZodSchema>>({
    resolver: zodResolver(documentDraftingZodSchema),
    defaultValues: {
        name: "DocumentDrafting",
        configurationType: "OnPrem",
        llm: "gemma",
        nodePrompt: "",
        temperature: 0.2,
        setupObject:{
          documentTitle: "",
          documentType: "",
          guidelines: "",
          outputStructure: "",
          localizationNeeded: "",
          documents: null,
        }
      },
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const refineFormData = (
    formData: z.infer<typeof documentDraftingZodSchema>,
  ) => {
    return {...formData, taskName : selectedTask};
  };

  return {
    form,
    isDirty,
    isSubmitting,
    refineFormData
  };
};
