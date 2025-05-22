import { useMutation, useQueryClient } from "@tanstack/react-query";
//import { toast } from "@aventisia/ui/sonner";
import { updateAnnotationData } from "../apis/annotation-apis";
import { useLabelDataStore } from "../stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { useFetchAnnotationData } from "./useFetchAnnotationData";

export const useUpdateAnnotation = () => {
  // Get query client
  const queryClient = useQueryClient();
  const { refetch } = useFetchAnnotationData();

  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  return useMutation({
    mutationFn: updateAnnotationData,
    onSuccess: async () => {
      refetch();
      queryClient.invalidateQueries({
        queryKey: [["annotation", modelId], ["image"]],
      });
    },

    // onError: (error) => {
    //   toast.error(error.message);
    // },
  });
};
