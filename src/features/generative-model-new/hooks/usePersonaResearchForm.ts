import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { personaResearchZodSchema } from "../constants/generative-model-zod-schemas/persona-research-zod-schema";


export const usePersonaResearchForm = () => {
  const form = useForm<z.infer<typeof personaResearchZodSchema>>({
    resolver: zodResolver(personaResearchZodSchema),
    defaultValues: {
        personaName: "",
        companyName: "",
        referenceURLs: [{id: "", link: ""}],
        purposeOfResearch: "",
        desiredOutputs: "",
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
