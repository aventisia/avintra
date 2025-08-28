import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { applyModelTemplate } from "../apis/wroc-templates-apis";
import { UseTemplateDTO } from "../dtos/use-template-dto";

/**
 * useModelTemplateMutation
 *
 * React Query mutation hook to apply a selected model template.
 * Handles success and error side effects such as opening a new tab or showing a toast.
 */
export const useModelTemplateMutation = () => {
  return useMutation({
    // Mutation function to apply the model template
    mutationFn: async (originalData: UseTemplateDTO) => {
      return applyModelTemplate({
        ...originalData,
      });
    },

    // Handle API error: show a toast notification
    onError: (error) => {
      toast.error(
        error.toString() || "Failed to use this template. Please try again.",
      );
    },

    // Handle successful application: open Model in new tab with template ID and name
    onSuccess: (data) => {
      const url = `${import.meta.env.VITE_AISTUDIO_URL}/project?pid=${data.data.id}&pn=${data.data.name}&t=setup`;
      window.open(url, "_blank");
    },
  });
};
