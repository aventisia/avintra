import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  archiveFlowVersions,
  unarchiveFlowVersions,
} from "@/features/03-orchestrator/agents-table";

import { FLOWS_QUERY_KEY, FOLDERS_QUERY_KEY } from "../constants";

type ArchiveFlowVersionsPayload = {
  flowId: string;
  archive: boolean;
};

/**
 * Archives or unarchives every version of an agent and refreshes the agents lists.
 * A refused request opens an explanation dialog instead of an error toast.
 */
export const useArchiveFlowVersionsMutation = () => {
  const queryClient = useQueryClient();
  const { showCustomAlertDialog } = useShowAlertHandler();

  return useMutation({
    mutationFn: ({ flowId, archive }: ArchiveFlowVersionsPayload) =>
      archive ? archiveFlowVersions(flowId) : unarchiveFlowVersions(flowId),

    onSuccess: (httpResponse) => {
      queryClient.invalidateQueries({ queryKey: FLOWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });

      toast.success(httpResponse.message, {
        className: "sonner-toaster-sm",
      });
    },

    onError: (error, { archive }) => {
      // IMPORTANT NOTE: the axios instance rejects 400/409/429 with the backend message and
      // toasts every other status itself, so only those refusals open the dialog.
      if (typeof error !== "string") return;

      showCustomAlertDialog({
        title: archive ? "Cannot archive this agent" : "Cannot unarchive this agent",
        description: error,
        cancelBtnText: "",
        confirmBtnText: "Close",
        confirmActionFn: () => undefined,
      });
    },
  });
};
