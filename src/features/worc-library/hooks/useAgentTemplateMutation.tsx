import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { applyAgentTemplate } from "../apis/wroc-templates-apis";
import { UseTemplateDTO } from "../dtos/use-template-dto";

/**
 * useAgentTemplateMutation
 *
 * React Query mutation hook to apply an agent template.
 * On success, opens Agent Builder with the template's reference ID.
 */
export const useAgentTemplateMutation = () => {
  return useMutation({
    // API call to apply the agent template
    mutationFn: async (originalData: UseTemplateDTO) => {
      return applyAgentTemplate({
        id: originalData.id,
        name: originalData.name,
        description: originalData.description,
        refId: originalData.refId,
      });
    },

    // Show error toast if the mutation fails
    onError: (error) => {
      toast.error(
        error.toString() || "Failed to use this template. Please try again.",
      );
    },

    // On success, open Agent Builder with the applied template
    onSuccess: (data) => {
      if (data?.data?.type == "AIProject") {
        window.location.href = `${import.meta.env.VITE_AISTUDIO_URL}/project?pid=${data.data.id}&v=${data.data.id}&pn=${data.data.name}&t=setup`;
      }
      if (data?.data?.type == "Agent" || data?.data?.type == "Block") {
        window.location.href = `${import.meta.env.VITE_AGENTBUILDER_URL}/agent?f=${data.data.refId}`;
      }
    },
  });
};
