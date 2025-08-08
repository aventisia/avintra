import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@aventisia/ui/sonner";
import { updateGenerativeModelSetupFormData } from "../apis/generative-model-setup-apis";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { useGenerativeModelOutputStore } from "../store/generative-model-output-store";

export const useUpdateGenerativeModelForm = () => {
  const queryClient = useQueryClient();
  const { modelId } = useLabelDataStore(
      useShallow((state) => ({
        modelId: state.modelId,
  })));
  const {setConversationMarkdown} = useGenerativeModelOutputStore();

  const {
    mutate: updateFormData,
    isPending: isUpdatePending,
  } = useMutation({
    mutationFn: updateGenerativeModelSetupFormData,
    onSuccess: async (data) => {
      setConversationMarkdown([data?.data])
      queryClient.invalidateQueries({ queryKey: ["GENERATIVE_SETUP_FORM_DATA"] });
      queryClient.invalidateQueries({ queryKey: ["model", modelId] });
      toast.success("Data saved successfully");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return {
    updateFormData,
    isUpdatePending,
  };
};
