import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { thoughtLeadershipZodSchema } from "../constants/generative-model-zod-schemas/thought-leadership-zod-schema";
import { useSelectedTaskStore } from "../store/selected-task-store";


export const useThoughtLeadershipForm = () => {
  const {selectedTask} = useSelectedTaskStore();
  const form = useForm<z.infer<typeof thoughtLeadershipZodSchema>>({
    resolver: zodResolver(thoughtLeadershipZodSchema),
    defaultValues: {
      name: "",
      llm: "gemma",
      nodePrompt: "",
      temperature: 0.2,
      configurationType: "OnPrem",
      setupObject: {
        documentType: "",
        topic: "",
        industry: "",
        purposeOfArticle: "",
        toneAndStyle: "",
        targetAudience: "",
        dataAndStats: "",
        links: [{id: "", url: ""}],
        documents: null,
        outputLength: "",
        outputStructure: "",
      }
    },
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const refineFormData = (
    formData: z.infer<typeof thoughtLeadershipZodSchema>,
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
