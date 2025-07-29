import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { thoughtLeadershipZodSchema } from "../constants/generative-model-zod-schemas/thought-leadership-dto";


export const useThoughtLeadershipForm = () => {
  const form = useForm<z.infer<typeof thoughtLeadershipZodSchema>>({
    resolver: zodResolver(thoughtLeadershipZodSchema),
    defaultValues: {
        documentType: "",
        topic: "",
        industry: "",
        purposeOfArticle: "",
        toneAndStyle: "",
        targetAudience: "",
        dataAndStats: "",
        links: [{id: "", link: ""}],
        documents: null,
        outputLength: "",
        outputStructure: "",
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
