import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { validateTemplate } from "../apis/save-as-template-apis";
import { useSaveAsTemplateStore } from "../stores/save-as-template-store";

/**
 * useValidateTemplateMutation
 *
 * Custom hook to handle the template validation API call.
 * Updates validation status based on the response and shows toast messages for errors.
 */
export const useValidateTemplateMutation = () => {
  // Get setValidationStatus action from the store
  const { setValidationStatus } = useSaveAsTemplateStore(
    useShallow((state) => ({
      setValidationStatus: state.setValidationStatus,
    })),
  );

  // Define mutation using React Query
  const { isPending, mutate } = useMutation({
    // Function that triggers the API call
    mutationFn: validateTemplate,

    // Handle successful response
    onSuccess: (httpResponse) => {
      if (httpResponse.data) setValidationStatus(httpResponse.data);
    },

    // Handle API errors
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Return mutation function and loading state
  return {
    isPending,
    mutate,
  };
};
