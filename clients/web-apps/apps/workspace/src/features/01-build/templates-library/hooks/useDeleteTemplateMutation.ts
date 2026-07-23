import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { deleteTemplate } from "../apis/avplatform-templates-apis";

/**
 * useDeleteTemplateMutation
 *
 * Custom hook to handle the "Deleting Template" API mutation.
 * Manages side effects like closing the dialog and showing toast messages.
 */
export const useDeleteTemplateMutation = () => {
  // Get query client
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  // Define mutation using React Query
  const { isPending, mutate } = useMutation({
    // Function that triggers the API call
    mutationFn: deleteTemplate,

    // Called on successful mutation
    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });

      queryClient.invalidateQueries({
        queryKey: ["PROJECT_TEMPLATE"],
        exact: true,
      });

      navigate("/library");
    },

    // Called on mutation error
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Expose mutation and pending state
  return {
    isPending,
    mutate,
  };
};
