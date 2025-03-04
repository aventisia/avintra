import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { insertAnnotationData } from "../apis/annotation-apis";

export const useInsertAnnotation = () => {
  return useMutation({
    mutationFn: insertAnnotationData,

    onError: (error) => {
      toast.error(error.message);
    },
  });
};
