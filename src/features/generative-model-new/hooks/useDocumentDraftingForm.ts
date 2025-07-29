import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { documentDraftingZodSchema } from "../constants/generative-model-zod-schemas/document-drafting-zod-schema";


export const useDocumentDraftingForm = () => {
  const form = useForm<z.infer<typeof documentDraftingZodSchema>>({
    resolver: zodResolver(documentDraftingZodSchema),
    defaultValues: {
        documentTitle: "",
        documentType: "",
        guidelines: "",
        outputStructure: "",
        localizationNeeded: "",
        documents: null,
        configurationType: "OnPrem",
        llm: "gemma",
        nodePrompt: "",
        temperature: 0.2
    },
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  return {
    form,
    isDirty,
    isSubmitting
  };
};
