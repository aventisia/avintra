import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { validateTemplate } from "../apis/save-as-template-apis";
import { useSaveAsTemplateStore } from "../stores/save-as-template-store";
import { useShallow } from "zustand/react/shallow";
import { ValidateTemplateDto } from "../dto/validate-template-dto";

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

  // Helper to check if all templates are approved
  function areAllTemplatesApproved(items: ValidateTemplateDto[]): boolean {
    return items.every((item) => item.isApprovedTemplate);
  }

  // Define mutation using React Query
  const { isPending, mutate } = useMutation({
    // Function that triggers the API call
    mutationFn: validateTemplate,

    // Handle successful response
    onSuccess: (httpResponse) => {
      if (httpResponse.data)
        setValidationStatus(areAllTemplatesApproved(httpResponse.data));
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
