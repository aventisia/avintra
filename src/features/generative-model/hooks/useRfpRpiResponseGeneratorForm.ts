import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { rfpRpiResponseGeneratorZodSchema } from "../constants/generative-model-zod-schemas/rfp-rpi-response-generator-zod-schema";
import { useSelectedTaskStore } from "../store/selected-task-store";


export const useRfpRpiResponseGeneratorForm = () => {
    const {selectedTask} = useSelectedTaskStore();
    const form = useForm<z.infer<typeof rfpRpiResponseGeneratorZodSchema>>({
      resolver: zodResolver(rfpRpiResponseGeneratorZodSchema),
      defaultValues: {
          name: "RFPResponseGenerator",
          configurationType: "OnPrem",
          llm: "gemma",
          nodePrompt: "",
          temperature: 0.2,
          setupObject: {          
            clientName: "",
            clientLink: "",
            rfiRfpDocuments: null,
            responseStrategy: "",
            responseBoundaries: "",
            links: [{id: "", url: ""}],
            referenceDocuments: null,
          }
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
