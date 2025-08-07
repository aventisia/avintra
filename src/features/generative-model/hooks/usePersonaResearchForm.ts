import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { personaResearchZodSchema } from "../constants/generative-model-zod-schemas/persona-research-zod-schema";
import { useSelectedTaskStore } from "../store/selected-task-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGenerativeModelSetupFormData } from "../apis/generative-model-setup-apis";
import { toast } from "@aventisia/ui/sonner";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";


export const usePersonaResearchForm = () => {
  const {selectedTask} = useSelectedTaskStore();
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const form = useForm<z.infer<typeof personaResearchZodSchema>>({
    resolver: zodResolver(personaResearchZodSchema),
    defaultValues: {
        name: "PersonaResearch",
        configurationType: "OnPrem",
        llm: "gemma",
        temperature: 0.2,
        nodePrompt: "",
        setupObject: {
          personaName: "",
          companyName: "",
          links: [{id: "", url: ""}],
          purposeOfResearch: "",
          desiredOutput: "",
        },
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

  // updateGenerativeModelSetupFormData
  
  const queryClient = useQueryClient();
 
  // Mutation to update form data
  const { mutate: updateFormData, isPending: isUpdatePending } = useMutation({
    mutationFn: updateGenerativeModelSetupFormData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["GENERATIVE_SETUP_FORM_DATA"],
      });
      queryClient.invalidateQueries({
        queryKey: ["model", modelId],
      });
      toast.success("Data saved successfully");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return {
    form,
    isDirty,
    isSubmitting,
    refineFormData,
    updateFormData,
    isUpdatePending
  };
};
