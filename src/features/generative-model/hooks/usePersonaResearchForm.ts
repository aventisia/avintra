import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { personaResearchZodSchema } from "../constants/generative-model-zod-schemas/persona-research-zod-schema";
import { useSelectedTaskStore } from "../store/selected-task-store";


export const usePersonaResearchForm = () => {
  const {selectedTask} = useSelectedTaskStore();
  const form = useForm<z.infer<typeof personaResearchZodSchema>>({
    resolver: zodResolver(personaResearchZodSchema),
    defaultValues: {
        taskName: "",
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

  const refineFormData = (
    formData: z.infer<typeof personaResearchZodSchema>,
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
