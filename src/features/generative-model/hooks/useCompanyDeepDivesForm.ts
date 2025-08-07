import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { companyDeepDivesZodSchema } from "../constants/generative-model-zod-schemas/company-deep-dives-zod-schema";
import { useSelectedTaskStore } from "../store/selected-task-store";


export const useCompanyDeepDivesForm = () => {
  const {selectedTask} = useSelectedTaskStore();
  const form = useForm<z.infer<typeof companyDeepDivesZodSchema>>({
    resolver: zodResolver(companyDeepDivesZodSchema),
    defaultValues: {
        name: "CompanyDeepDive",
        temperature: 0.2,
        configurationType: "OnPrem",
        llm: "gemma",
        nodePrompt: "",
        setupObject: {
          taskName: "",
          companyName: "",
          websiteLink: "",
          focusAreas: "",
          webData: "",
          links: [{id: "", url: ""}],
          summaryDepth: "",
          documents: null,
        }

    },
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const refineFormData = (
    formData: z.infer<typeof companyDeepDivesZodSchema>,
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
