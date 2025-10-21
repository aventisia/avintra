import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { deleteVersionResource } from "../apis/version-resource-apis";

/**
 * Custom hook to delete a version resource by its unique id.
 * Returns mutation object from react-query.
 */
export function useDeleteVersionResource() {
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: deleteVersionResource,
    onSuccess: () => {
      toast.success("File deleted successfully");
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to delete version resource";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    },
  });

  return { mutate, isPending, isSuccess, isError };
}
