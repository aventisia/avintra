import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { companyDeepDivesZodSchema } from "../constants/generative-model-zod-schemas/company-deep-dives-zod-schema";


export const useCompanyDeepDivesForm = () => {
  const form = useForm<z.infer<typeof companyDeepDivesZodSchema>>({
    resolver: zodResolver(companyDeepDivesZodSchema),
    defaultValues: {
        companyName: "",
        websiteLink: "",
        focusAreas: "",
        webData: "",
        links: [{id: "", link: ""}],
        documents: null,
        summaryDepth: "",
        configurationType: "OnPrem",
        llm: "gemma",
        nodePrompt: "",
        temperature: 0.2,
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
