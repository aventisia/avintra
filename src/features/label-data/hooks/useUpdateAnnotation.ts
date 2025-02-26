import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateAnnotationData } from "../apis/annotation-apis";
import { useModelDataStore } from "../stores/model-data-store";
import { useShallow } from "zustand/react/shallow";

export const useUpdateAnnotation = () => {
  // Get query client
  const queryClient = useQueryClient();

  const { modelId } = useModelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  return useMutation({
    mutationFn: updateAnnotationData,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [["annotation", modelId], ["image"]],
      });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
};
