import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { rfpRpiResponseGeneratorZodSchema } from "../constants/generative-model-zod-schemas/rfp-rpi-response-generator-dto";
import { useSelectedTaskStore } from "../store/selected-task-store";


export const useRfpRpiResponseGeneratorForm = () => {
    const {selectedTask} = useSelectedTaskStore();
  const form = useForm<z.infer<typeof rfpRpiResponseGeneratorZodSchema>>({
    resolver: zodResolver(rfpRpiResponseGeneratorZodSchema),
    defaultValues: {
        taskName: "",
        clientName: "",
        clientLink: "",
        rfiRfpDocuments: null,
        responseStrategy: "",
        responseBoundaries: "",
        links: [{id: "", link: ""}],
        referenceDocuments: null,
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
    formData: z.infer<typeof rfpRpiResponseGeneratorZodSchema>,
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
