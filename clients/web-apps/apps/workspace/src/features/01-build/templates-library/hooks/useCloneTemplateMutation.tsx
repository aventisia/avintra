import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { stripLeadingSlash } from "@/utils/strip-leading-slash";

import { applyAgentTemplate } from "../apis/avplatform-templates-apis";
import { UseTemplateDTO } from "../dtos/use-template-dto";

/**
 * useCloneTemplateMutation
 *
 * React Query mutation hook to clone template.
 * On success, opens Agent Builder with the template's reference ID.
 */
export const useCloneTemplateMutation = () => {
  return useMutation({
    // API call to apply the template
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
      toast.error(error.toString() || "Failed to use this template. Please try again.");
    },

    // On success, open Agent Builder with the applied template
    onSuccess: (data) => {
      if (
        data?.data?.type == FlowTypesEnum.Agent ||
        data?.data?.type == FlowTypesEnum.ChatAgent ||
        data?.data?.type == FlowTypesEnum.Block
      ) {
        window.open(
          `${import.meta.env.VITE_STUDIO_PATH}${stripLeadingSlash(data.data.accessPath)}`,
          "_blank",
        );
      }
    },
  });
};
